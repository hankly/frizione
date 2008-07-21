/*
Copyright (c) 2008 John Leach

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

/**
  * Macro that counts filtered project/application/module files.
  *
  * Parameters:
  * <ul>
  * <li><code>action</code> action value.</li>
  * <li><code>group</code> the group object.</li>
  * <li><code>includes</code> a comma separeated list of extensions.</li>
  * <li><code>excludes</code> an optional comma separated list of excluded extensions.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function filesCount_macro(params) {
    var action = (params && params.action) ? params.action : null;
    var group = (params && params.group) ? params.group : null;
    var includes = (params && params.includes) ? params.includes : null;
    var excludes = (params && params.excludes) ? params.excludes : null;
    if (group === null || includes === null || action === null) {
        return "[Missing parameters: No files found]";
    }

    var dir = group.dir;
    var type = group.type;
    includes = includes.split(/\s?,\s?/);
    excludes = excludes ? excludes.split(/\s?,\s?/) : null;
    var result = fileutils.filterList(group.files, includes, excludes);
    if (result.length > 0) {
        var units = result.length === 1 ? "file" : "files";
        return "<a href='/frizione/" + type + "s/" + dir + "/" + action + "'>" + result.length + " " + units + "</a>";
    }
    else {
        return "No files found";
    }
}

/**
  * Macro that lists filtered application files.
  *
  * Required parameters:
  * <ul>
  * <li><code>action</code> action value.</li>
  * <li><code>group</code> the group object.</li>
  * <li><code>includes</code> a comma separeated list of extensions.</li>
  * <li><code>excludes</code> an optional comma separated list of excluded extensions.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function filesList_macro(params) {
    var action = (params && params.action) ? params.action : null;
    var group = (params && params.group) ? params.group : null;
    var includes = (params && params.includes) ? params.includes : null;
    var excludes = (params && params.excludes) ? params.excludes : null;
    if (group === null || includes === null || action === null) {
        return "<p>[Missing parameters: No files found]</p>";
    }

    var dir = group.dir;
    var type = group.type;
    includes = includes.split(/\s?,\s?/);
    excludes = excludes ? excludes.split(/\s?,\s?/) : null;
    var result = fileutils.filterList(group.files, includes, excludes);
    var length = result.length;
    if (length > 0) {
        var html = "";
        for (var i = 0; i < length; i += 1) {
            var file = result[i];
            html += "<p>"
                      + "<a href='/frizione/" + type + "s/" + dir + "/" + action + encode(file) + "'>"
                          + "<code>" + encode(file) + "</code>"
                      + "</a>"
                  + "</p>";
        }
        return html;
    }
    else {
        return "<p>No files found</p>";
    }
}

/**
  * Reports the title of the join/minify/test commands.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the command type, one of 'join', 'minify', or 'test'.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function commandTitleReport_macro(params) {
    var data = res.data;

    data.hasErrors = hasCommandErrors();
    if (!data.hasErrors) {
        switch (params.type) {
            case 'join':
                return '<h2>Successful join (concatenation)</h2>'
                     + '<p>Frizione is delighted to inform you that the join was completed with the following results:</p>';
            case 'minify':
                return '<h2>Successful minify</h2>'
                        + '<p>Frizione is delighted to inform you that the minify was completed with the following results:</p>';
            case 'test':
                return '<h2>Successful test preparation</h2>'
                     + '<p>Frizione is delighted to inform you that the file: <code>' + data.file + '</code> is ready for testing:</p>';
        }
    }
    switch (params.type) {
        case 'join':
            return '<h2>Uhm, bad news, so brace yourself.</h2>'
                 + '<p>Frizione got confused while attempting to join (concatenate) the file: <code>' + data.file + '</code>:</p>';
        case 'minify':
            return '<h2>Uhm, bad news, so brace yourself.</h2>'
                 + '<p>Frizione got confused while attempting to minify the file: <code>' + data.file + '</code>:</p>';
        case 'test':
            return '<h2>Uhm, bad news, so brace yourself.</h2>'
                 + '<p>Frizione got confused attempting to prepare the file: <code>' + data.file + '</code> for testing:</p>';
    }
}

/**
  * Reports the results and errors of the join/minify/test command.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the command type, one of 'join', 'minify', or 'test'.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function commandReport_macro(params) {
    var data = res.data;
    var result = "";

    data.hasErrors = hasCommandErrors();
    if (!data.hasErrors) {
        switch (params.type) {
            case 'join':
                return successReport();
            case 'minify':
                return successReport();
            case 'test':
                result = successReport()
                     + '<div style="margin: 0 1.0em;">'
                     + '<h2>Unit Tests</h2>'
                     + '<div style="margin: 0 0.5em;">';
                if (data.testParams.rc) {
                    result += '<p>' + data.testParams.rc + '</p>';
                }
                result += '<div id="test-results"></div>'
                        + '</div>'
                        + '</div>';
                return result;
        }
    }
    return failedReport();
}

/**
 * Checks if there were errors in the supplied commands.
 *
 * @return true if there were errors, otherwise false.
 */
function hasCommandErrors() {
    var data = res.data;

    if (data.joinParams && data.joinParams.errors) {
        return true;
    }
    if (data.minifyParams && data.minifyParams.errors) {
        return true;
    }
    if (data.testParams && data.testParams.errors) {
        return true;
    }
    return false;
}

/**
 * Reports the successful execution results.
 */
function successReport() {
    var data = res.data;
    var messages = null
    var i = 0;
    var length = 0;

    var result = '<div style="margin: 0 1.5em; clear: both;">';
    result += '<p><code>&#160;&#160;to: ' + data.to + '</code></p>';
    result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + data.textLength + ' characters</p>';
    if (data.minifyParams) {
        result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;minified size: </code>' + data.minifyParams.minifiedTextLength + ' characters</p>';
        if (data.minifyParams.messages) {
            messages = data.minifyParams.messages;
            length = messages.length;
            result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;messages:</code><ul>';
            for (i = 0; i < length; i += 1) {
                result += '<li><code>' + messages[i] + '</code></li>';
            }
            result += '</ul></p>';
        }
    }
    if (data.testParams) {
        result += '<p><code>json: ' + data.testParams.json + '</code></p>';
    }
    if (data.gzip) {
        result += '<p><code>gzip: ' + data.gzip + '</code></p>';
        result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + data.gzipLength + ' bytes</p>';
    }
    result += '</div>';
    return result;
}

/**
 * Reports the failed execution results.
 */
function failedReport() {
    var data = res.data;
    var errors = null;
    var i = 0;
    var length = 0;
    var result = '<div style="margin: 0 1.5em; clear: both;">';
    if (data.joinParams && data.joinParams.errors) {
        result += '<p>Join parameter errors:</p><ul>';
        errors = data.joinParams.errors;
        length = errors.length;
        for (i = 0; i < length; i += 1) {
            result += '<li><code>' + errors[i] + '</code></li>';
        }
        result += '</ul>';
    }
    if (data.minifyParams && data.minifyParams.errors) {
        result += '<p>Minify parameter errors:</p><ul>';
        errors = data.minifyParams.errors;
        length = errors.length;
        for (i = 0; i < length; i += 1) {
            result += '<li><code>' + errors[i] + '</code></li>';
        }
        result += '</ul>';
    }
    if (data.testParams && data.testParams.errors) {
        result += '<p>Test parameter errors:</p><ul>';
        errors = data.testParams.errors;
        length = errors.length;
        for (i = 0; i < length; i += 1) {
            result += '<li><code>' + errors[i] + '</code></li>';
        }
        result += '</ul>';
    }
    result += '</div>';
    return result;
}