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

/*globals res, encode, getProperty */
/*globals crash, frizione */

if (!this.frizione.macros) {
    frizione.macros = {};
}

/**
 * Prepares and displays the service main page.
 * See {@link frizione.macros.serviceFilesList}.
 *
 * @param {Join, JsLint, Minify, Test, View} service the service object.
 */
frizione.macros.serviceMainPage = function (service) {
    var data = {};
    data.title = service.serviceText + " : " + service.group.name + " : " + frizione.qualifiedVersion();
    data.group = service.group;
    data.head = "./head.html";
    data.body = "./service/body.html";
    data.explain = service.explain;
    data.service = service.service;
    data.list = frizione.macros.serviceFilesList(service.group, service.includes, service.excludes, service.service);

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
};

/**
 * Produces a HTML fragment of the files list.
 *
 * @param {Application, Module, Project} group the group (application/module/project) object.
 * @param {Array} includes the includable file extensions (with leading dot), for example ".png".
 * @param {Array} excludes the excludable file extensions (with leading dot), for example ".exclude.png".
 * @param {String} action the anchor action, for example "jslint".
 * @return {String} the HTML fragment.
 */
frizione.macros.serviceFilesList = function (group, includes, excludes, action) {
    var dir = group.dir;
    var type = group.type;
    var result = frizione.group.filterList(group.files, includes, excludes);
    var length = result.length;
    if (length > 0) {
        var html = "";
        for (var i = 0; i < length; i += 1) {
            var file = result[i];
            html += "            <p>" +
                        "<a href='/frizione/" + type + "s/" + dir + "/" + action + encode(file) + "'>" +
                            "<code>" + encode(file) + "</code>" +
                        "</a>" +
                    "</p>\n";
        }
        return html;
    }
    else {
        return "            <p>No files found</p>";
    }
};

/**
 * Checks if there were errors in the supplied commands.
 *
 * @param {Object} results the parsed command results.
 * @return {Boolean} true if there were errors, otherwise false.
 */
frizione.macros.hasCommandErrors = function (results) {
    if (results.jsdocParams && results.jsdocParams.errors) {
        return true;
    }
    if (results.joinParams && results.joinParams.errors) {
        return true;
    }
    if (results.minifyParams && results.minifyParams.errors) {
        return true;
    }
    if (results.testParams && results.testParams.errors) {
        return true;
    }
    return false;
};

/**
 * Reports the title of the join/minify/test commands.
 *
 * @param {String} type the service type.
 * @param {Object} results the parsed command results.
 * @return {String} the HTML fragment.
 */
frizione.macros.commandTitleReport = function (type, results) {
    if (frizione.macros.hasCommandErrors(results) === false) {
        switch (type) {
            case 'jsdoc':
                return '<h2>Successful JsDoc (documentation generation)</h2>\n' +
                       '<p>Frizione is delighted to inform you that the documentation was generated with the following results:</p>';
            case 'join':
                return '<h2>Successful join (concatenation)</h2>\n' +
                       '<p>Frizione is delighted to inform you that the join was completed with the following results:</p>';
            case 'minify':
                return '<h2>Successful minify</h2>\n' +
                       '<p>Frizione is delighted to inform you that the minify was completed with the following results:</p>';
            case 'test':
                return '<h2>Successful test preparation</h2>\n' +
                       '<p>Frizione is delighted to inform you that the file: <code>' + results.file + '</code> is ready for testing:</p>';
        }
    }
    var badNews = '<h2>Uhm, bad news, so brace yourself.</h2>\n';
    switch (type) {
        case 'jsdoc':
            return badNews +
                   '<p>Frizione got confused while attempting to generate documentation using the file: <code>' + results.file + '</code>:</p>';
        case 'join':
            return badNews +
                   '<p>Frizione got confused while attempting to join (concatenate) the file: <code>' + results.file + '</code>:</p>';
        case 'minify':
            return badNews +
                   '<p>Frizione got confused while attempting to minify the file: <code>' + results.file + '</code>:</p>';
        case 'test':
            return badNews +
                   '<p>Frizione got confused attempting to prepare the file: <code>' + results.file + '</code> for testing:</p>';
    }
};

/**
 * Reports the results and errors of the join/minify/test command.
 *
 * @param {String} type the service type.
 * @param {Object} results the parsed command results.
 * @return {String} the HTML fragment.
 */
frizione.macros.commandReport = function (type, results) {
    var html = "";

    function successReport() {
        var messages = null;
        var i = 0;
        var length = 0;

        var html = '<div class="report" style="clear: both;">';
        html += '<p><code>&#160;&#160;to: ' + results.to + '</code></p>';
        html += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + results.textLength + ' characters</p>';
        if (results.minifyParams) {
            html += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;minified size: </code>' + results.minifyParams.minifiedTextLength + ' characters</p>';
            if (results.minifyParams.messages) {
                messages = results.minifyParams.messages;
                length = messages.length;
                html += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;messages:</code><ul>';
                for (i = 0; i < length; i += 1) {
                    html += '<li><code>' + messages[i] + '</code></li>';
                }
                html += '</ul></p>';
            }
        }
        if (results.testParams) {
            html += '<p><code>json: ' + results.testParams.json + '</code></p>';
        }
        if (results.gzip) {
            html += '<p><code>gzip: ' + results.gzip + '</code></p>';
            html += '<p><code>&#160;&#160;&#160;&#160;&#160;&#160;size: </code>' + results.gzipLength + ' bytes</p>';
        }
        html += '</div>';
        return html;
    }

    function failureReport() {
        var errors = null;
        var i = 0;
        var length = 0;
        var html = '<div class="report" style="clear: both;">';
        if (results.jsdocParams && results.jsdocParams.errors) {
            html += '<p>JsDoc parameter errors:</p><ul>';
            errors = results.jsdocParams.errors;
            length = errors.length;
            for (i = 0; i < length; i += 1) {
                html += '<li><code>' + errors[i] + '</code></li>';
            }
            html += '</ul>';
        }
        if (results.joinParams && results.joinParams.errors) {
            html += '<p>Join parameter errors:</p><ul>';
            errors = results.joinParams.errors;
            length = errors.length;
            for (i = 0; i < length; i += 1) {
                html += '<li><code>' + errors[i] + '</code></li>';
            }
            html += '</ul>';
        }
        if (results.minifyParams && results.minifyParams.errors) {
            html += '<p>Minify parameter errors:</p><ul>';
            errors = results.minifyParams.errors;
            length = errors.length;
            for (i = 0; i < length; i += 1) {
                html += '<li><code>' + errors[i] + '</code></li>';
            }
            html += '</ul>';
        }
        if (results.testParams && results.testParams.errors) {
            html += '<p>Test parameter errors:</p><ul>';
            errors = results.testParams.errors;
            length = errors.length;
            for (i = 0; i < length; i += 1) {
                html += '<li><code>' + errors[i] + '</code></li>';
            }
            html += '</ul>';
        }
        html += '</div>';
        return html;
    }

    if (frizione.macros.hasCommandErrors(results) === false) {
        switch (type) {
            case 'jsdoc':
                html = '<div class="report" style="clear: both;">' +
                       '<p><code>output to: ' + results.jsdocParams.d + '</code></p>' +
                       '</div>';
                var warnings = null;
                var i = 0;
                var length = 0;
                if (results.jsdocParams.warnings) {
                    html += '<div class="report" style="clear: both;">';
                    html += '<p>But JsDoc also produced some warnings:</p><ul>';
                    warnings = results.jsdocParams.warnings;
                    length = warnings.length;
                    for (i = 0; i < length; i += 1) {
                        html += '<li><code>' + warnings[i] + '</code></li>';
                    }
                    html += '</ul></div>';
                }
                return html;
            case 'join':
                return successReport();
            case 'minify':
                return successReport();
            case 'test':
                html = successReport() +
                       '<div class="standard">' +
                       '<h2>Unit Tests</h2>' +
                       '</div>' +
                       '<div class="report">';
                if (results.testParams.rc) {
                    html += '<p>' + results.testParams.rc + '</p>';
                }
                html += '<div id="test-results"></div></div>';
                return html;
        }
    }
    return failureReport();
};

/**
 * Sets the body tag for the test page.
 *
 * @param {Object} results the parsed command results.
 * @return {String} the HTML fragment.
 */
frizione.macros.setTestBodyTag = function (results) {
    var params = results.testParams;
    var type = params.type;
    var group = results.group;

    if (group.type === 'project') {
        var frizione = "/frizione/" + group.type + "s/" + group.dir + '/';
        var project = results.mountPoint + '/' + group.dir;
        var func = null;
        if (type === 'workerpool') {
            func = 'onload=\'clutch.storeTests("' +
                   project + params.to +
                   '", "' +
                   frizione + "writefixture" + params.json +
                   '", "' +
                   frizione + "jsontest" + params.json +
                   '");\'';
        }
        else {
            func = 'onload=\'clutch.storeTests(runClutchTests, "' +
                   frizione + "writefixture" + params.json +
                   '", "' +
                   frizione + "jsontest" + params.json +
                   '");\'';
        }
        return '    <body ' + func + '>';
    }
    else {
        return "    <body>";
    }
};