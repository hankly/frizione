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

/*jslint evil: true */
/*globals app, req, res, crash */

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
        this.renderMainPage();
    }
}

/**
 * Renders the list page.
 */
function renderMainPage() {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.group = this.group;

    var typeName = 'JavaScript';
    data.title = typeName + " Test : " + this.group.name + " : " + qualifiedVersion();
    data.explain = "Frizione just can't wait to test the following JavaScript files, though it might take a while:";
    data.action = 'jstest';
    data.includes = ".test.js";
    data.excludes = null;
    if (this.type === 'json') {
        typeName = "JSON";
        data.title = typeName + " Test Results : " + this.group.name + " : " + qualifiedVersion();
        data.explain = "Frizione just can't wait to display the following JSON test results files:";
        data.action = 'jsontest';
        data.includes = ".test.json";
        data.excludes = null;
    }

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body');
    this.renderSkin('Layout');
}

/**
 * Renders the test page.
 *
 * @param file the JavaScript file to test.
 */
function renderTestPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = "JavaScript Test : " + this.group.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    data.file = file;
app.debug("Start join " + req.runtime);
    var result = services.join(this.group.path + file);
app.debug("Start services " + req.runtime);
    services.execute(file, result, 'test', 'js', data, groupDir(this.group).toString() + '/' + this.group.dir);
app.debug("End services " + req.runtime);

    data.head = this.renderSkinAsString('Head.Test');
    data.body = this.renderSkinAsString('Body.Test');
    this.renderSkin('Layout');
}

/**
 * Renders the test result page.
 *
 * @param file the JavaScript file to test.
 */
function renderEmbeddedTestPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = "JavaScript Test : " + this.group.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    data.file = file;
    app.debug("Start join " + req.runtime);
    var result = services.join(this.group.path + file);
    app.debug("End join " + req.runtime);
    data.testParams = services.parseTestParams(result);
    if (data.testParams === null) {
        data.testParams = {};
        data.testParams.errors = [ 'No /*test ... */ command found in text' ];
    }
    else {
        data.testParams.to = "./"; // the to parameter is superfluous here
        data.testParams.errors = services.checkTestParams(data.testParams, file, file, null);
    }

    if (data.testParams.errors) {
        data.head = renderSkinAsString('Head');
        data.body = this.renderSkinAsString('Body.Test');
    }
    else {
        eval(result);
        if (!runCrashTests) {
            data.testParams.errors = [ "No 'runCrashTests' function defined" ];
            data.head = renderSkinAsString('Head');
            data.body = this.renderSkinAsString('Body.Test');
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

            data.json = tests.summarise();
            data.json.summary.date = date;
            result = JSON.stringify(data.json, null, "\t");
            var path = this.group.path + data.testParams.json;
            fileutils.makeDirs(path);
            fileutils.writeJson(path, result);

            data.head = renderSkinAsString('Head');
            data.body = this.renderSkinAsString('Body.Result');
        }
    }
    this.renderSkin('Layout');
}

/**
 * Renders the test result page.
 *
 * @param file the test results JSON file.
 */
function renderTestResultPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = "JSON Test Results : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    data.file = file;
    data.json = fileutils.readJson(this.group.path + file);

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body.Result');
    this.renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Test.getChildElement " + name);
    return this;
}