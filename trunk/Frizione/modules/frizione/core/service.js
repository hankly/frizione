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

/*globals app, crash, frizione, java, com, org */
/*globals Fixture, Join, JsDoc, JsLint, Minify, Test, View */

/**
 * The Frizione service ({@link Fixture}/{@link Join}/{@link JsLint}/{@link Minify}/{@link Test}/{@link View})
 *  support code.
 *
 * @namespace
 */
frizione.service = {

    /**
     * Sets the services for a Application/Module/Project object.
     *
     * @param {Application, Module, Project} group the application/module/project object.
     * @return {Object} the services object.
     */
    setServices: function (group) {
        var services = { };
        services.jslint = new JsLint(group);
        services.jsdoc = new JsDoc(group);
        services.jsonview = new View(group, 'json');
        services.htmlview = new View(group, 'html');
        services.cssjoin = new Join(group, 'css');
        services.jsjoin = new Join(group, 'js');
        services.cssminify = new Minify(group, 'css');
        services.jsminify = new Minify(group, 'js');
        services.jstest = new Test(group, 'js');
        services.jsontest = new Test(group, 'json');
        services.readfixture = new Fixture(group, 'read');
        services.writefixture = new Fixture(group, 'write');
        return services;
    },

    /**
     * Executes a join/minify/test command, and stores the results.
     *
     * @param (String) file the original file path.
     * @param {String} text the text content to join/minify/test.
     * @param {String} command the command, one of 'join', 'minify', or 'test'.
     * @param {String} type the file type, one of 'js' or 'css'.
     * @param {Object} result the results object.
     * @param {String} toPath the destination path.
     */
    execute: function (file, text, command, type, result, toPath) {
        var service = frizione.service;
        result.joinParams = service.parseJoinParams(text);
        result.minifyParams = service.parseMinifyParams(text);
        result.testParams = service.parseTestParams(text);
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
            result.joinParams.errors = service.checkJoinParams(result.joinParams, file, result.to, result.gzip);
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
            result.minifyParams.errors = service.checkMinifyParams(result.minifyParams, file, result.to, result.gzip);
            result.minifyParams.textLength = result.length;
            if (result.minifyParams.errors === null) {
                minifiedText = service.minify(text, type, result.minifyParams);
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
            result.testParams.errors = service.checkTestParams(result.testParams, file, result.to, result.gzip);
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

        var finalText = minifiedText || text;
        var toFile = app.getServerDir() + '/' + toPath + result.to;
        var outputFile = frizione.file(toFile);
        outputFile.mkdirs();
        outputFile.writeText(finalText, result.cs);
        if (result.gzip) {
            toFile = app.getServerDir() + '/' + toPath + result.gzip;
            outputFile = frizione.file(toFile);
            outputFile.mkdirs();
            var outputStream = new java.util.zip.GZIPOutputStream(new java.io.FileOutputStream(outputFile.file));
            var outputWriter = new java.io.BufferedWriter(new java.io.OutputStreamWriter(outputStream));
            outputWriter.write(finalText);
            outputWriter.flush();
            outputStream.finish();
            outputWriter.close();
            result.gzipLength = outputFile.size();
        }
    },

    /**
     * Joins (concatenates) the specified file.
     *
     * @param {String} path the path to join.
     * @param {String} charset the (optional) character set to use (defaults to "UTF-8").
     * @param {Object} data the (optional) data to insert (defaults to the empty object { }).
     * @return {String} the joined file contents.
     */
    join: function (path, charset, data) {
        charset = charset || "UTF-8";
        data = data || { };
        return crash.st.load(frizione.resource(path), {}, charset, '<', false);
    },

    /**
     * Minifies (compresses) the specified file contents.
     *
     * @param {String} text the file contents.
     * @param {String} type the file fype, either 'css' or 'js'.
     * @param {Object} params the minify paramaters.
     * @return {String} the minified file contents.
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
        }
    },

    /**
     * Parses the embedded jsdoc command parameters.
     *
     * @param {String} text the text containing the commands.
     * @return {Object} the jsdoc parameters, or null if none found.
     */
    parseJsDocParams: function (text) {
        var jsdocExp = /\/\*jsdoc\s((.|[\r\n])+?)\*\//;
        var results = jsdocExp.exec(text);
        if (results === null || results.length < 2) {
            return null;
        }
        return this.parseParams(results[1].split('\n'), [ "src" ]);
    },

    /**
     * Parses the embedded join command parameters.
     *
     * @param {String} text the text containing the commands.
     * @return {Object} the join parameters, or null if none found.
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
     * @param {String} text the text containing the commands.
     * @return {Object} the minify parameters, or null if none found.
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
     * @param {String} text the text containing the commands.
     * @return {Object} the test parameters, or null if none found.
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
     * @param {Array} list the string array.
     * @param {Array} multiple the multiple params string array.
     * @return {Object} the parameters.
     */
    parseParams: function (list, multiple) {
        multiple = multiple || [];
        multiple = " " + multiple.join(' ') + " ";
        var params = { };
        var errors = [];
        var paramExp = /\s?([\S]*)\s?:\s?([\S\s]*)/;
        var length = list !== null ? list.length : 0;
        var results = null;
        var name = null;
        var value = null;
        var oldValue = null;
        for(var i = 0; i < length; i += 1) {
            results = paramExp.exec(list[i]);
            if (results !== null && results.length === 3) {
                name = results[1];
                value = results[2].trim();
                if (typeof (oldValue = params[name]) !== 'undefined') {
                    if (multiple.indexOf(' ' + name + ' ') >= 0) {
                        if (typeof oldValue === "string") {
                            params[name] = [];
                            params[name].push(oldValue);
                        }
                        params[name].push(value);
                    }
                    else {
                        multiple += ' ' + name + ' ';
                        errors.push("Multiple definition of parameter '" + name + "'");
                    }
                }
                else {
                    params[name] = value;
                }
            }
        }
        if (errors.length > 0) {
            params.errors = errors;
        }
        return params;
    },

    /**
     * Checks the given JsDoc parameters.
     *
     * Valid parameters:
     * <ul>
     * <li><code>src</code> the source file path (can be used multiple times).</li>
     * <li><code>a</code> include all functions, even undocumented ones.</li>
     * <li><code>d</code> specifies the output directory.</li>
     * <li><code>e</code> specifies the file encoding to use.</li>
     * <li><code>n</code> ignore all code, only document comments with @name tags.</li>
     * <li><code>p</code> include symbols tagged as private, underscored and inner symbols.</li>
     * <li><code>s</code> suppress source code output.</li>
     * </ul>
     *
     * @param {Object} params the parameters to check.
     * @return {Array} an array of errors, or <code>null</code> if no errors occurred.
     */
    checkJsDocParams: function (params) {
        var errors = params.errors || [];

        if (!params.src) {
            errors.push("Missing 'src' parameter value");
        }
        if (!params.d) {
            errors.push("Missing 'd' parameter value");
        }
        return errors.length > 0 ? errors : null;
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
     * @param {Object} params the parameters to check.
     * @param {String} file the original file path.
     * @param {String} to the amalgamated output file path.
     * @param {String} gzip the amalgamated gzip file path.
     * @return {Array} an array of errors, or <code>null</code> if no errors occurred.
     */
    checkJoinParams: function (params, file, to, gzip) {
        var errors = params.errors || [];

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
     * @param {Object} params the parameters to check.
     * @param {String} file the original file path.
     * @param {String} to the amalgamated output file path.
     * @param {String} gzip the amalgamated gzip file path.
     * @return {Array} an array of errors, or <code>null</code> if no errors occurred.
     */
    checkMinifyParams: function (params, file, to, gzip) {
        var errors = params.errors || [];

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
     * <li><code>type</code> the test environment type, one of 'browser', 'gears', 'workerpool', 'rhino' (default is 'browser').</li>
     * </ul>
     *
     * @param {Object} params the parameters to check.
     * @param {String} file the original file path.
     * @param {String} to the amalgamated output file path.
     * @param {String} gzip the amalgamated gzip file path.
     * @return {Array} an array of errors, or <code>null</code> if no errors occurred.
     */
    checkTestParams: function (params, file, to, gzip) {
        var errors = params.errors || [];

        if (!params.type) {
            params.type = 'browser';
        }
        switch (params.type) {
            case 'browser':
            case 'gears':
            case 'workerpool':
                break;
            case 'rhino':
                if (!params.to) {
                    params.to = './';
                }
                break;
            default:
                errors.push("Unknown type value '" + params.type + "'");
        }
        if (!params.to) {
            errors.push("Missing 'to' parameter value");
        }
        if (!params.cs) {
            params.cs = "UTF-8";
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
    }
};