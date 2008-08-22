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

/*global app, req, res, encode, getProperty */
/*global crash, frizione, View */

/**
 * @class The View object.
 * This object responds to <code>/jsonview</code> and <code>/htmlview</code> URLs.
 *
 * @name View
 * @constructor
 *
 * @description Creates a new View object.
 *
 * @param {Application, Module, Project} group the application/module/project object.
 * @param {String} type the view type, either 'json' or 'html'.
 */
function constructor(group, type) {
    app.debug('View ' + type + ": " + group.type + ": " + group.name);
    this.group = group;
    this.type = type;
    if (type === 'html') {
        this.explain = "Frizione will cheerfully redirect you to the following HTML files:";
        this.typeName = "HTML";
        this.service = 'htmlview';
        this.serviceText = "View HTML";
        this.includes = [ ".html" ];
        this.excludes = null;
    }
    else {
        this.explain = "Frizione will be delighted to display the following JSON files:";
        this.typeName = 'JSON';
        this.service = 'jsonview';
        this.serviceText = "View JSON";
        this.includes = [ ".json" ];
        this.excludes = [ ".test.json" ];
    }
}

/**
 * Default (main) action for view operations.
 * See {@link frizione.macros.serviceMainPage}, and
 * {@link View#renderViewPage}.
 */
View.prototype.main_action = function () {
    app.debug("View Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        if (this.type === 'html') {
            res.redirect(frizione.group.projectsMountPoint() + '/' + this.group.dir + file);
        }
        else {
            this.renderViewPage(file);
        }
    }
    else {
        if (req.data.action === "refresh") {
            app.debug("View Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
};

/**
 * Renders the view page.
 *
 * @param {String} file the JSON file to view.
 */
View.prototype.renderViewPage = function (file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./view/body.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    var text = frizione.file(this.group.path + file).readText();
    data.file = file;
    data.text = encode(text);

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
View.prototype.getChildElement = function (name) {
    app.debug("View.getChildElement " + name);
    return this;
};