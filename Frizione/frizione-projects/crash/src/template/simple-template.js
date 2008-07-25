/*
Copyright (c) 2008 The Crash Team.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
 * Inspired by EJS - Embedded JavaScript, written by Edward Benson
 * http://www.edwardbenson.com/projects/ejs
*/

/*jslint evil: true */
/*globals crash, JSLINT */

/**
 * @requires crash.file
 */

if (!this.crash) {
    crash = {};
}

crash.st = {

    cache: {},

    environment: function (path, data, charset, delim) {
        return {
            include: function () {
                var result = [];
                var nextPath = file.parent() + "/";
                var length = arguments.length;
                for (var i = 0; i < length; i += 1) {
                    var newPath = crash.file(nextPath + arguments[i]);
                    if (!newPath.exists() || !newPath.isFile()) {
                        throw new Error('SimpleTemplate.include ' + arguments[i] + " (" + newPath +
                                        ") doesn't exist, or isn't a file (" + path + ")");
                    }
                    if (result.length > 0) {
                        result.push("\n");
                    }
                    result.push(crash.st.load(path + arguments[i], data, charset, delim));
                }
                return result.join('');
            }
        };
    },

    load: function (path, data, charset, delim) {
        var file = crash.file(path);
        var modified = file.lastModified();
        var cached = crash.st.cache[path];
        if (cached && cached.modified === modified) {
            return cached.render(data);
        }

        charset = charset || "UTF-8";
        delim = delim || '<';
        data = data || {};
        var compiled = {
            modified: modified,
            process: null,

            render : function (data) {
                var functions = crash.st.environment(path, data, charset, delim);
                return compiled.process.call(functions, data, functions);
            }
        };

        var text = file.readText(charset);
        var left = delim;
        var right = '';
        switch (left) {
            case '[':
                right = ']';
                break;
            case '<':
                right = '>';
                break;
            case '{':
                right = '}';
                break;
            default:
                throw new Error("SimpleTemplate: " + left + ' is not a supported deliminator');
        }

        var leftDelimiter = left + '%';
        var rightDelimiter = '%' + right;
        var leftEqual = left + '%=';
        var leftComment = left + '%#';

        var scan = function (receiver) {
            var leftDelimiterLength = leftDelimiter.length;
            var rightDelimiterLength = rightDelimiter.length;
            var start = 0;
            var end = text.length;
            var index = 0;
            var nextChar = '';
            while (start < end) {
                index = text.indexOf(leftDelimiter, index);
                if (index < 0) {
                    receiver(text.substring(start));
                    return;
                }
                else {
                    nextChar = text.charAt(index + leftDelimiterLength);
                    if (nextChar === '%') {
                        receiver('<');
                        receiver('%');
                        index += leftDelimiterLength + 1;
                    }
                    else {
                        receiver(text.substring(start, index));
                        if (nextChar === '=' || nextChar === '#') {
                            receiver(leftDelimiter + nextChar);
                            index += 1;
                        }
                        else {
                            receiver(leftDelimiter);
                        }
                        index += leftDelimiterLength;
                        start = index;
                        index = text.indexOf(rightDelimiter, index);
                        if (index < 0) {
                            receiver(text.substring(start));
                            receiver(rightDelimiter);
                            return;
                        }
                        else {
                            receiver(text.substring(start, index));
                            receiver(rightDelimiter);
                            index += rightDelimiterLength;
                            start = index;
                        }
                    }
                }
            }
        };

        function clean(content) {
            content = content.replace(/\\/g, '\\\\');
            content = content.replace(/\n/g, '\\n');
            content = content.replace(/"/g, '\\"');
            return content;
        }

        var buffer = [];
        var startTag = null;
        
        function outputLines(pre, cleaner, text, post) {
            var start = 0;
            var end = text.length;
            var index = 0;
            var str = '';
            while (start < end) {
                index = text.indexOf('\n', index);
                if (index < 0) {
                    str = cleaner ? clean(text.substring(start)) + '\\n' : text.substring(start);
                    buffer.push(pre + str + post + '\n');
                    return;
                }
                str = cleaner ? clean(text.substring(start, index)) + '\\n' : text.substring(start, index);
                buffer.push(pre + str + post + '\n');
                index += 1;
                start = index;
            }
        }

        buffer.push("var ___p = [];");

        scan(function (token) {
            if (startTag === null) {
                switch (token) {
                    case leftDelimiter:
                    case leftEqual:
                    case leftComment:
                        startTag = token;
                        break;
                    default:
                        outputLines('___p.push("',  true, token, '");');
                        break;
                }
            }
            else {
                if (token === rightDelimiter) {
                        startTag = null;
                }
                else {
                    switch (startTag) {
                        case leftDelimiter:
                            buffer.push(token);
                            break;
                        case leftEqual:
                            buffer.push('___p.push(' + token + ');');
                            break;
                        default:
                            buffer.push(token);
                            break;
                    }
                }
            }
        });

        var result = buffer.join('');
        var toBeEvaled = 'with(___view) {' +
                             'with (___context) {' +
                                  result +
                                 'return ___p.join("");' +
                             '}' +
                         '}';

        try {
            compiled.process = new Function("___context", "___view", toBeEvaled);
        }
        catch (e) {
            if (typeof JSLINT === 'function') {
                JSLINT(result);
                var error = JSLINT.errors[0];
                var jsLintError = new Error();
                jsLintError.fileName = path;
                error.line += 1;
                jsLintError.lineNumber = error.line;
                jsLintError.message = path + ' line ' + error.line + ', ' + error.reason + '\n';
                throw jsLintError;
            }
            else {
                throw e;
            }
        }

        crash.st.cache[path] = compiled;
        return compiled.render(data);
    }
};