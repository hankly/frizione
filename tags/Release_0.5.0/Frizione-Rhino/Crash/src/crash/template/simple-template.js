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
 * @namespace Specialised functions for a simple templating mechanism.
 */
crash.st = {

    /**
     * The template cache.
     */
    cache: {},

    /**
     * Creates the template environment.
     * The environment function is called by <a href="#.load">crash.st.load</a>, and receives all its
     * parameters directly from that function.
     * Currently the only method available (in the template) is include.
     * 
     * @param {crash.resource} resource the template resource.
     * @param {Object} data the template data.
     * @param {String} charset the template character set.
     * @param {String} delim the template delimiter.
     * @return {Object} the template environment.
     */
    environment: function (resource, data, charset, delim) {
        return {

            /**
             * Includes a comma separated list of templates, each relative to the position of the current template.
             */
            include: function () {
                var result = [];
                var length = arguments.length;
                for (var i = 0; i < length; i += 1) {
                    var nextResource = resource.resource(arguments[i]);
                    if (result.length > 0) {
                        result.push("\n");
                    }
                    result.push(crash.st.load(nextResource, data, charset, delim));
                }
                return result.join('');
            }
        };
    },

    /**
     * Loads and executes the template.
     *
     * @param {crash.resource} resource the template resource.
     * @param {Object} data the (optional) template data, defaults to {}.
     * @param {String} charset the (optional) template character set, defaults to "UTF-8".
     * @param {String} delim the (optional) template delimiter character, defaults to '<'.
     * @param {boolean} useCache the (optional) use cache flag, defaults to true.
     * @return {String} the executed template.
     */
    load: function (resource, data, charset, delim, useCache) {
        data = data || {};
        if (typeof useCache === 'undefined') {
            useCache = true;
        }

        var oldCache = null;
        if (useCache) {
            var cached = crash.st.cache[resource.original];
            if (cached) {
                return cached.render(data);
            }
        }
        else {
            oldCache = crash.st.cache;
            crash.st.cache = {};
        }

        charset = charset || "UTF-8";
        delim = delim || '<';
        var compiled = {

            process: null,

            render : function (data) {
                var functions = crash.st.environment(resource, data, charset, delim);
                return compiled.process.call(functions, data, functions);
            }
        };

        var text = resource.readText(charset);
        if (text === null) {
            throw new Error("SimpleTemplate.load " + resource.url.toString() + " doesn't exist");
        }
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
                    str = cleaner ? clean(text.substring(start)) : text.substring(start);
                    buffer.push(pre + str + post);
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
                jsLintError.fileName = resource.original;
                error.line += 1;
                jsLintError.lineNumber = error.line;
                jsLintError.message = resource.original + ' line ' + error.line + ', ' + error.reason + '\n';
                throw jsLintError;
            }
            else {
                throw e;
            }
        }

        crash.st.cache[resource.url] = compiled;
        if (oldCache !== null) {
            crash.st.cache = oldCache;
        }
        return compiled.render(data);
    }
};