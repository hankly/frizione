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
  * Reports the results and errors of the join/minify/test commands.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the command type, one of 'join', 'minify', or 'test'.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function commandsReport_macro(params) {
    var data = res.data;

    data.hasErrors = hasCommandErrors();
    if (!data.hasErrors) {
        switch (params.type) {
            case 'join':
                return successfulJoin();
            case 'minify':
                return successfulMinify();
            case 'test':
                return successfulTest();
        }
    }
    switch (params.type) {
        case 'join':
            return failedJoin();
        case 'minify':
            return failedMinify();
        case 'test':
            return failedTest();
    }
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
 * Reports the successful join results.
 */
function successfulJoin() {
    var data = res.data;
    var result = '<h2>Successful join (concatenation)</h2></div><div style="margin: 0 1.5em; clear: both;">'
    result += '<p>Frizione successfully joined (concatenated) the file: <code>' + data.file + '</code></p>';
    return result + successReport();
}

/**
 * Reports the successful minify results.
 */
function successfulMinify() {
    var data = res.data;
    var result = '<h2>Successful minify</h2></div><div style="margin: 0 1.5em; clear: both;">'
    result += '<p>Frizione successfully minified the file: <code>' + data.file + '</code></p>';
    return result + successReport();
}

/**
 * Reports the successful test results.
 */
function successfulTest() {
    var data = res.data;
    var result = '<h2>Successful test preparation</h2></div><div style="margin: 0 1.5em; clear: both;">'
    result += '<p>Frizione successfully prepared the file: <code>' + data.file + '</code> for testing</p>';
    result += successReport();
    result += '</div><div style="margin: 0 1.0em;"><h2>Unit Tests</h2><div style="margin: 0 0.5em;">';
    if (data.testParams.rc) {
        result += '<p>' + data.testParams.rc + '</p>';
    }
    result += '<div id="test-results"></div></div>';
    return result;
}

/**
 * Reports the successful execution results.
 */
function successReport() {
    var data = res.data;

    var result = '<p><code>&#160;&#160;to: /' + data.project.dir + data.to + '</code></p>';
    result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + data.textLength + ' characters</p>';
    if (data.minifyParams) {
        result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;minified size: </code>' + data.minifyParams.minifiedTextLength + ' characters</p>';
    }
    if (data.testParams) {
        result += '<p><code>json: /' + data.project.dir + data.testParams.json + '</code></p>';        
    }
    if (data.gzip) {
        result += '<p><code>gzip: /' + data.project.dir + data.gzip + '</code></p>';
        result += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + data.gzipLength + ' bytes</p>';
    }
    return result;
}

/**
 * Reports the failed join results.
 */
function failedJoin() {
    var data = res.data;
    var result = '<h2>Uhm, bad news, so brace yourself.</h2></div><div style="margin: 0 1.5em; clear: both;">';
    result += '<p>Frizione got confused while attempting to join (concatenate) the file: <code>' + data.file + '</code></p>';
    return result + failedReport();
}

/**
 * Reports the failed minify results.
 */
function failedMinify() {
    var data = res.data;
    var result = '<h2>Uhm, bad news, so brace yourself.</h2></div><div style="margin: 0 1.5em; clear: both;">';
    result += '<p>Frizione got confused while attempting to minify the file: <code>' + data.file + '</code></p>';
    return result + failedReport();
}

/**
 * Reports the failed test results.
 */
function failedTest() {
    var data = res.data;
    var result = '<h2>Uhm, bad news, so brace yourself.</h2></div><div style="margin: 0 1.5em; clear: both;">';
    result += '<p>Frizione got confused attempting to prepare the file: <code>' + data.file + '</code> for testing</p>';
    return result + failedReport();
}

/**
 * Reports the failed execution results.
 */
function failedReport() {
    var data = res.data;
    var errors = null;
    var i = 0;
    var length = 0;
    var result = "";

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
    return result;
}