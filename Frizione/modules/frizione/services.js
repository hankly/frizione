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

services = {

    /**
     * Executes a join/minify/test command, and stores the results.
     *
     * @param file the original file path.
     * @param text the text content to join/minify/test.
     * @param command the command, one of 'join', 'minify', or 'test'.
     * @param type the file type, one of 'js' or 'css'.
     * @param result the results object.
     * @param toPath the destination path.
     */
    execute: function (file, text, command, type, result, toPath) {

        result.joinParams = services.parseJoinParams(text);
        result.minifyParams = services.parseMinifyParams(text);
        result.testParams = services.parseTestParams(text);
        result.textLength = text.length;

        if (command === 'test') {
            result.to = (result.testParams && result.testParams.to) ? result.testParams.to :
                        (result.minifyParams && result.minifyParams.to) ? result.minifyParams.to :
                        (result.joinParams && result.joinParams.to) ? result.joinParams.to : null;
            if (result.to) {
                if (result.testParams && !result.testParams.to) {
                    result.testParams.to = result.to;
                }
                if (result.minifyParams && !result.minifyParams.to) {
                    result.minifyParams.to = result.to;
                }
                if (result.joinParams && !result.joinParams.to) {
                    result.joinParams.to = result.to;
                }
            }
            result.gzip = (result.testParams && result.testParams.gzip) ? result.testParams.gzip :
                          (result.minifyParams && result.minifyParams.gzip) ? result.minifyParams.gzip :
                          (result.joinParams && result.joinParams.gzip) ? result.joinParams.gzip : null;
        }
        else {
            result.to = (result.minifyParams && result.minifyParams.to) ? result.minifyParams.to :
                        (result.joinParams && result.joinParams.to) ? result.joinParams.to : null;
            if (result.to) {
                if (result.minifyParams && !result.minifyParams.to) {
                    result.minifyParams.to = result.to;
                }
                if (result.joinParams && !result.joinParams.to) {
                    result.joinParams.to = result.to;
                }
            }
            result.gzip = (result.minifyParams && result.minifyParams.gzip) ? result.minifyParams.gzip :
                          (result.joinParams && result.joinParams.gzip) ? result.joinParams.gzip : null;
        }
        result.cs = (result.minifyParams && result.minifyParams.cs) ? result.minifyParams.cs : "UTF-8";

        if (result.joinParams) {
            result.joinParams.errors = services.checkJoinParams(result.joinParams, file, result.to, result.gzip);
            if (result.joinParams.errors) {
                return;
            }
        }
        if (command === 'join') {
            if (result.joinParams === null) {
                result.joinParams = {};
                result.joinParams.errors = [ 'No /*join ... */ command found in text' ];
            }
            if (result.joinParams.errors) {
                return;
            }
        }

        var minifiedText = null;
        if (result.minifyParams) {
            result.minifyParams.errors = services.checkMinifyParams(result.minifyParams, file, result.to, result.gzip);
            result.minifyParams.textLength = result.length;
            if (result.minifyParams.errors === null) {
app.debug("Start minify " + req.runtime);
                minifiedText = services.minify(text, type, result.minifyParams);
                result.minifyParams.minifiedTextLength = minifiedText.length;
            }
            else {
                return;
            }
        }
        if (command === 'minify') {
            if (result.minifyParams === null) {
                result.minifyParams = {};
                result.minifyParams.errors = [ 'No /*minify ... */ command found in text' ];
            }
            if (result.minifyParams.errors) {
                return;
            }
        }

        if (result.testParams) {
            result.testParams.errors = services.checkTestParams(result.testParams, file, result.to, result.gzip);
        }
        if (command === 'test') {
            if (result.testParams === null) {
                result.testParams = {};
                result.testParams.errors = [ 'No /*test ... */ command found in text' ];
            }
            if (result.testParams.errors) {
                return;
            }
        }

app.debug("Start write " + req.runtime);
        var finalText = minifiedText || text;
        var toFile = toPath + result.to;
        fileutils.makeDirs(toFile);
        fileutils.writeText(toFile, finalText, result.cs);
        if (result.gzip) {
app.debug("Start gzip " + req.runtime);
            toFile = toPath + result.gzip;
            fileutils.makeDirs(toFile);
            var outputStream = new java.util.zip.GZIPOutputStream(new java.io.FileOutputStream(toFile));
            var outputWriter = new java.io.BufferedWriter(new java.io.OutputStreamWriter(outputStream));
            outputWriter.write(finalText);
            outputWriter.flush();
            outputStream.finish();
            outputWriter.close();
            result.gzipLength = new java.io.File(toFile).length();
        }
    },

    /**
     * Joins (concatenates) the specified file.
     *
     * @param path the project path to join.
     * @param charset the character set to use (defaults to "UTF-8").
     * @param data the data to insert (defaults to the empty object { }).
     * @return the joined file contents.
     */
    join: function (path, charset, data) {
        charset = charset || "UTF-8";
        data = data || { };
        return new EJS(path, charset, '<').render(data);
    },

    /**
     * Minifies (compresses) the specified file contents.
     *
     * @param text the file contents.
     * @param type the file fype, either 'css' or 'js'.
     * @param params the minify paramaters.
     * @return the minified file contents.
     */
    minify: function(text, type, params) {

        var inputReader = new java.io.StringReader(text);
        var compressor = null;
        var outputWriter = new java.io.StringWriter(text.length);

        if (type === 'css') {

            compressor = new com.yahoo.platform.yui.compressor.CssCompressor(inputReader);
            inputReader.close();

            compressor.compress(outputWriter, params.mc);
            return outputWriter.toString();
        }
        else {

            /* Just doesn't work, probably because rhino is already present*/
            var reporter = {

                errors: [],

                messages: [],

                format: function(message, source, line, column) {
                    return source + "(" + line + ":" + column + ") " + message;
                },

                warning: function(message, source, line, lineText, column) {
                    reporter.messages.push(reporter.format(message, source, line, column));
                },

                error: function (message, source, line, lineText, column) {
                    var text = reporter.format(message, source, line, column);
                    reporter.messages.push(text);
                    reporter.errors.push(text);
                },

                runtimeError: function (message, source, line, lineText, column) {
                    var text = reporter.format(message, source, line, column);
                    reporter.messages.push(text);
                    reporter.errors.push(text);
                    return new org.mozilla.javascript.EvaluatorException(message);
                }
            };

            var errorReporter = new org.mozilla.javascript.ErrorReporter(reporter);
            compressor = new com.yahoo.platform.yui.compressor.JavaScriptCompressor(inputReader, errorReporter);
            inputReader.close();
            if (reporter.errors.length > 0) {
                params.errors = reporter.errors;
            }
            if (reporter.messages.length > 0) {
                params.messages = reporter.messages;
            }

            compressor.compress(outputWriter, params.mc, params.munge, params.v, params.ps, !params.opt);
            return String(outputWriter.toString());
            /**/
            /*
            var commands = [
                    'java',
                    '-jar',
                    new java.io.File(app.getServerDir() + '/' + YUICOMPRESSOR).getCanonicalFile().toString(),
                    '--type',
                    'js',
                    '--charset',
                    'UTF-8',
                    '--line-break',
                    params.mc
            ];

            if (params.v === true) {
                commands.push('--verbose');
            }
            if (params.munge === false) {
                commands.push('--nomunge');
            }
            if (params.ps === true) {
                commands.push('--preserve-semi');
            }
            if (params.opt === false) {
                commands.push('--disable-optimizations');
            }

            // see http://www.javaworld.com/javaworld/jw-12-2000/jw-1229-traps.html
            compressor = java.lang.Runtime.getRuntime().exec(commands);
            var outputStream = fileutils.processStreamWriter(compressor.getOutputStream(), 'output', text);
            var inputStream = fileutils.processStreamReader(compressor.getInputStream(), 'input');
            var errorStream = fileutils.processStreamReader(compressor.getErrorStream(), 'error');
            var outputStreamThread = new java.lang.Thread(new java.lang.Runnable(outputStream));
            var inputStreamThread = new java.lang.Thread(new java.lang.Runnable(inputStream));
            var errorStreamThread = new java.lang.Thread(new java.lang.Runnable(errorStream));
            inputStreamThread.start();
            errorStreamThread.start();
            outputStreamThread.start();
            var exitValue = compressor.waitFor();
            compressor.destroy();
            return String(inputStream.buffer);
            */
        }
    },

    /**
     * Parses the embedded join command parameters.
     *
     * @param text the text containing the commands.
     * @return the join parameters, or null if none found.
     */
    parseJoinParams: function (text) {
        var joinExp = /\/\*join\s((.|[\r\n])+?)\*\//;
        var results = joinExp.exec(text);
        if (results === null || results.length < 2) {
            return null;
        }
        return this.parseParams(results[1].split('\n'));
    },

    /**
     * Parses the embedded minify command parameters.
     *
     * @param text the text containing the commands.
     * @return the minify parameters, or null if none found.
     */
    parseMinifyParams: function (text) {
        var minifyExp = /\/\*minify\s((.|[\r\n])+?)\*\//;
        var results = minifyExp.exec(text);
        if (results === null || results.length < 2) {
            return null;
        }
        return this.parseParams(results[1].split('\n'));
    },

    /**
     * Parses the embedded test command parameters.
     *
     * @param text the text containing the commands.
     * @return the test parameters, or null if none found.
     */
    parseTestParams: function (text) {
        var testExp = /\/\*test\s((.|[\r\n])+?)\*\//;
        var results = testExp.exec(text);
        if (results === null || results.length < 2) {
            return null;
        }
        return this.parseParams(results[1].split('\n'));
    },

    /**
     * Parses the parameters from a string array.
     *
     * @param list the string array.
     * @return the parameters.
     */
    parseParams: function (list) {
        var params = { };
        var paramExp = /\s?([\S]*)\s?:\s?([\S\s]*)/;
        var length = list !== null ? list.length : 0;
        for(var i = 0; i < length; i += 1) {
            var results = paramExp.exec(list[i]);
            if (results !== null && results.length === 3) {
                params[results[1]] = results[2].trim();
            }
        }
        return params;
    },

    /**
     * Checks the given join parameters.
     *
     * Valid parameters:
     * <ul>
     * <li><code>to</code> the file path to write the joined file to.</li>
     * <li><code>gzip</code> the file path to write the gzipped file to.</li>
     * </ul>
     *
     * @param params the parameters to check.
     * @param file the original file path.
     * @param to the amalgamated output file path.
     * @param gzip the amalgamated gzip file path.
     * @return an array of errors, or null if no errors occurred.
     */
    checkJoinParams: function (params, file, to, gzip) {
        var errors = [];

        if (!params.to && !to) {
            errors.push("Missing 'to' parameter value");
        }
        if (to === params.to && file === to) {
            errors.push("The original file cannot be overwritten by the 'to' parameter");
        }
        if (gzip === params.gzip && file === gzip) {
            errors.push("The original file cannot be overwritten by the 'gzip' parameter");
        }
        return errors.length > 0 ? errors : null;
    },

    /**
     * Checks the given minify parameters.
     *
     * Valid parameters:
     * <ul>
     * <li><code>to</code> the file path to write the minified file to.</li>
     * <li><code>cs</code> the character set of the input and output file (default is UTF-8).</li>
     * <li><code>gzip</code> the file path to write the gzipped file to.</li>
     * <li><code>mc</code> the maximum number of characters before a forced line break (default is 0).</li>
     * <li><code>munge</code> reduce function and variable names (default is false).</li>
     * <li><code>ps</code> preserve semicolons (default is true).</li>
     * <li><code>opt</code> use micro optimisations (default is true).</li>
     * <li><code>v</code> display errors and warnings (default is true).</li>
     * </ul>
     *
     * @param params the parameters to check.
     * @param file the original file path.
     * @param to the amalgamated output file path.
     * @param gzip the amalgamated gzip file path.
     * @return an array of errors, or null if no errors occurred.
     */
    checkMinifyParams: function (params, file, to, gzip) {
        var errors = [];

        if (!params.to) {
            errors.push("Missing 'to' parameter value");
        }
        if (!params.cs) {
            params.cs = "UTF-8";
        }
        if (!params.mc) {
            params.mc = -1;
        }
        if (!params.munge) {
            params.munge = false;
        }
        else {
            if (params.munge.toLowerCase() === 'true') {
                params.munge = true;
            }
            else {
                params.munge = false;
            }
        }
        if (!params.ps) {
            params.ps = true;
        }
        else {
            if (params.ps.toLowerCase() === 'true') {
                params.ps = true;
            }
            else {
                params.ps = false;
            }
        }
        if (!params.opt) {
            params.opt = true;
        }
        else {
            if (params.opt.toLowerCase() === 'true') {
                params.opt = true;
            }
            else {
                params.opt = false;
            }
        }
        if (!params.v) {
            params.v = true;
        }
        else {
            if (params.v.toLowerCase() === 'true') {
                params.v = true;
            }
            else {
                params.v = false;
            }
        }
        if (to === params.to && file === to) {
            errors.push("The original file cannot be overwritten by the 'to' parameter");
        }
        if (gzip === params.gzip && file === gzip) {
            errors.push("The original file cannot be overwritten by the 'gzip' parameter");
        }
        return errors.length > 0 ? errors : null;
    },

    /**
     * Checks the given test parameters.
     *
     * Valid parameters:
     * <ul>
     * <li><code>to</code> the file path to write the test file to.</li>
     * <li><code>cs</code> the character set of the input and output file (default is UTF-8).</li>
     * <li><code>gzip</code> the file path to write the gzipped file to.</li>
     * <li><code>json</code> the file path to write the unit test JSON file to.</li>
     * <li><code>rc</code> the run comment to be displayed.</li>
     * <li><code>vc</code> the view comment to be displayed.</li>
     * <li><code>type</code> the test environment type, one of 'browser', 'gears', 'workerpool' (default is 'browser').</li>
     * </ul>
     *
     * @param params the parameters to check.
     * @param file the original file path.
     * @param to the amalgamated output file path.
     * @param gzip the amalgamated gzip file path.
     * @return an array of errors, or null if no errors occurred.
     */
    checkTestParams: function (params, file, to, gzip) {
        var errors = [];

        if (!params.to) {
            errors.push("Missing 'to' parameter value");
        }
        if (!params.cs) {
            params.cs = "UTF-8";
        }
        if (!params.type) {
            params.type = 'browser';
        }
        switch (params.type) {
            case 'browser':
            case 'gears':
            case 'workerpool':
                break;
            default:
                errors.push("Unknown type value '" + params.type + "'");
        }
        if (!params.json) {
            errors.push("Missing 'json' parameter value");
        }
        if (to === params.to && file === to) {
            errors.push("The original file cannot be overwritten by the 'to' parameter");
        }
        if (gzip === params.gzip && file === gzip) {
            errors.push("The original file cannot be overwritten by the 'gzip' parameter");
        }
        if (file === params.json) {
            errors.push("The original file cannot be overwritten by the 'json' parameter");
        }
        return errors.length > 0 ? errors : null;
    },

    /**
     * Gets the default JSLint options.
     */
    defaultJslintOptions: function () {

        return {
            adsafe     : false, // if ADsafe should be enforced
            bitwise    : true,  // if bitwise operators should not be allowed
            browser    : true,  // if the standard browser globals should be predefined
            cap        : false, // if upper case HTML should be allowed
            debug      : false, // if debugger statements should be allowed
            eqeqeq     : true,  // if === should be required
            evil       : false, // if eval should be allowed
            forin      : false, // if for in statements must filter
            fragment   : false, // if HTML fragments should be allowed
            glovar     : true,  // if global variables are not allowed
            laxbreak   : false, // if line breaks should not be checked
            nomen      : true,  // if names should be checked
            on         : false, // if HTML event handlers should be allowed
            passfail   : false, // if the scan should stop on first error
            plusplus   : true,  // if increment/decrement should not be allowed
            regexp     : false, // if the . should not be allowed in regexp literals
            rhino      : false, // if the Rhino environment globals should be predefined
            undef      : true,  // if variables should be declared before used
            sidebar    : false, // if the System object should be predefined
            white      : false, // if strict whitespace rules apply
            widget     : false  // if the Yahoo Widgets globals should be predefined
        };
    }
};