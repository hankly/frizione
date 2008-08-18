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

/*global app, req, res, crash, frizione, runCrashTests */
/*global encode, getProperty */
/*jslint evil: true */

/**
 * Test object constructor.
 *
 * @class Test
 * @constructor
 * @param group the project/application/module object.
 * @param type the test type, either 'json' or 'js'.
 */
function constructor(group, type) {
    app.debug('Test ' + type + ": " + group.type + ": " + group.name);
    this.group = group;
    this.type = type;
    if (this.type === 'json') {
        this.explain = "Frizione just can't wait to display the following JSON test results files:";
        this.typeName = "JSON";
        this.service = 'jsontest';
        this.serviceText = "Test Results";
        this.includes = [ ".test.json" ];
        this.excludes = null;
    }
    else {
        this.explain = "Frizione just can't wait to test the following JavaScript files, though it might take a while:";
        this.typeName = 'JavaScript';
        this.service = 'jstest';
        this.serviceText = "JavaScript Test";
        this.includes = [ ".test.js" ];
        this.excludes = null;
    }
}

/**
 * Default (main) action for test operations.
 */
function main_action() {
    app.debug("Test Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        if (this.type === 'json') {
            this.renderTestResultPage(file);
        }
        else {
            if (this.group.type === 'application' || this.group.type === 'module') {
                this.renderEmbeddedTestPage(file);
            }
            else {
                this.renderTestPage(file);
            }
        }
    }
    else {
        if (req.data.action === "refresh") {
            app.debug("Test Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
}

/**
 * Renders the test page.
 *
 * @param file the JavaScript file to test.
 */
function renderTestPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./unit-test/body.html";
    data.bodyTag = "    <body>";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var result = frizione.service.join(this.group.prefix + '/' + this.group.dir + '/' + file);
    frizione.service.execute(file, result, 'test', this.type, data, this.group.prefix + '/' + this.group.dir);

    if (data.testParams.errors === null) {
        if (data.testParams.type === 'rhino') {
            if (this.embeddedTest(result, data)) {
                return;
            }
        }
        else {
            data.head = "./unit-test/head.html";
            data.debug = getProperty('debug') === 'true';
            data.mountPoint = frizione.group.projectsMountPoint();
            data.bodyTag = frizione.macros.setTestBodyTag(data);
        }
    }

    data.reportTitle = frizione.macros.commandTitleReport('test', data);
    data.report = frizione.macros.commandReport('test', data);

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
}

/**
 * Renders the test result page.
 *
 * @param file the JavaScript file to test.
 */
function renderEmbeddedTestPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./unit-test/body.html";
    data.bodyTag = "    <body>";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var result = frizione.service.join(this.group.prefix + '/' + this.group.dir + '/' + file);
    data.testParams = frizione.service.parseTestParams(result);

    if (data.testParams === null) {
        data.testParams = {};
        data.testParams.errors = [ 'No /*test ... */ command found in text' ];
    }
    else {
        data.testParams.to = "./"; // the to parameter is superfluous here
        data.testParams.errors = frizione.services.checkTestParams(data.testParams, file, file, null);
    }

    if (data.testParams.errors === null) {
        if (this.embeddedTest(result, data)) {
            return;
        }
    }

    data.reportTitle = frizione.macros.commandTitleReport('test', data);
    data.report = frizione.macros.commandReport('test', data);

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
}

/**
 * Renders the test result page.
 *
 * @param file the test results JSON file.
 */
function renderTestResultPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./unit-test/result.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    data.relative = "../../../crash/unit-test/html/";
    var report = frizione.file(this.group.path + file).readJson();

    res.charset = "UTF-8";
    data.document = crash.resource("frizione/html/document.html");
    res.write(crash.test.htmlReport(report, data, getProperty('debug') !== 'true'));
}

/**
 * Executes the embedded test.
 *
 * @param {String} code the code to execute.
 * @param {Object} data the results data object.
 * @return {boolean} true if successful, otherwise false.
 */
function embeddedTest(code, data) {
    if (typeof runCrashTests === 'function') {
        runCrashTests = null;
    }

    eval(code);

    if (typeof runCrashTests !== 'function') {
        data.testParams.errors = [ "No 'runCrashTests' function defined" ];
        return false;
    }
    else {
        var tests = runCrashTests();
        var date = new Date().toUTCString();
        tests.run();

        var status = tests.check();
        while (status.complete === false) {
            crash.timer.pause(100);
            status = tests.check();
        }

        var json = tests.summarise();
        json.summary.date = date;
        var result = JSON.stringify(json, null, "\t");
        var path = app.getServerDir() + '/' + this.group.prefix + '/' + this.group.dir + data.testParams.json;
        var outputFile = frizione.file(path);
        outputFile.mkdirs();
        outputFile.writeText(result);

        data.body = "./unit-test/result.html";
        data.file = data.testParams.json;
        data.relative = "../../../crash/unit-test/html/";

        res.charset = "UTF-8";
        data.document = crash.resource("frizione/html/document.html");
        res.write(crash.test.htmlReport(json, data, getProperty('debug') !== 'true'));
        return true;
    }
}

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Test.getChildElement " + name);
    return this;
}