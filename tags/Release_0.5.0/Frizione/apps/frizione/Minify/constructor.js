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

/*global app, req, res, getProperty */
/*global crash, frizione, Minify */

/**
 * @class The Minify object.
 * This object responds to <code>/jsminify</code> and <code>/cssminify</code> URLs.
 *
 * @name Minify
 * @constructor
 *
 * @description Creates a new Minify object.
 *
 * @param {Application, Module, Project} group the application/module/project object.
 * @param {String} type the minify type, either 'css' or 'js'.
 */
function constructor(group, type) {
    app.debug('Minify ' + type + ": " + group.type + ": " + group.name);
    this.group = group;
    this.type = type;
    if (type === 'js') {
        this.explain = "Frizione will be pleased to minify the following JavaScript files, though it might take a while:";
        this.typeName = "JavaScript";
        this.service = 'jsminify';
        this.serviceText = "JavaScript Minify";
        this.includes = [ ".min.js" ];
        this.excludes = null;
    }
    else {
        this.explain = "Frizione will be pleased to minify the following CSS files, though it might take a while:";
        this.typeName = 'CSS';
        this.service = 'cssminify';
        this.serviceText = "CSS Minify";
        this.includes = [ ".min.css" ];
        this.excludes = null;
    }
}

/**
 * Default (main) action for minify operations.
 * See {@link frizione.macros.serviceMainPage}, and
 * {@link Minify#renderMinifyPage}.
 */
Minify.prototype.main_action = function () {
    app.debug("Minify Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        this.renderMinifyPage(file);
    }
    else {
        if (req.data.action === "refresh") {
            app.debug("Minify Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
};

/**
 * Renders the minify page.
 *
 * @param file the minify file to execute.
 */
Minify.prototype.renderMinifyPage = function (file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./service/result.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var result = frizione.service.join(this.group.prefix + '/' + this.group.dir + '/' + file);
    frizione.service.execute(file, result, 'minify', this.type, data, this.group.prefix + '/' + this.group.dir);
    data.reportTitle = frizione.macros.commandTitleReport('minify', data);
    data.report = frizione.macros.commandReport('minify', data);

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
};

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the child element.
 */
Minify.prototype.getChildElement = function (name) {
    app.debug("Minify.getChildElement " + name);
    return this;
};