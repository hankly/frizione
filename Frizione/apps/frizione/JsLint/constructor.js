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

/*global app, req, res, crash, frizione */
/*global JSLINT, encode */

/**
 * JsLint object constructor.
 *
 * @class JsLint
 * @constructor
 * @param group the project/application/module object.
 */
function constructor(group) {
    app.debug('JSLint: ' + group.type + ": " + group.name);
    this.group = group;
    this.explain = "Frizione will happily JSLint check the following JavaScript files:";
    this.typeName = "JavaScript";
    this.service = "jslint";
    this.serviceText = "JavaScript Lint";
    this.includes = [ ".js" ];
    this.excludes = [ ".jsdoc.js", ".join.js", ".test.js", ".min.js" ];
}

/**
 * Default (main) action for JSLint operations.
 */
function main_action() {
    app.debug("JsLint Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        this.renderLintPage(file);
    }
    else {
        if (req.data.action === "refresh") {
            app.debug("JsLint Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
}

/**
 * Renders the lint page.
 *
 * @param file the JavaScript file to lint.
 */
function renderLintPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./jslint/body.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var text = frizione.file(this.group.path + file).readText();
    data.text = encode(text);

    var options = frizione.group.jsLintOptions(this.group.path);
    var jsLint = {};

    function setOption(option) {
        var text = "disabled='disabled'";
        if (option) {
            text = text + " checked='checked'";
        }
        return text;
    }

    var prop = null;
    for (prop in options) {
        if (options.hasOwnProperty(prop)) {
            jsLint[prop] = setOption(options[prop]);
        }
    }

    data.jsLint = jsLint;
    data.result = JSLINT(text, options);
    data.errors = JSLINT.errors;
    data.report = JSLINT.report();

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
}

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the element.
 */
function getChildElement(name) {
    app.debug("JsLint.getChildElement " + name);
    return this;
}