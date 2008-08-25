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

/*global app, req, res */
/*global frizione, Application */

/**
 * @class The Helma Application object.
 * This object is created for each Helma application with a <code>frizione.json</code> file.
 *
 * @name Application
 * @constructor
 *
 * @description Creates a new Application object.
 *
 * @param {Object} info the (modified) project json file contents.
 */
function constructor(info) {
    app.debug('Application ' + info.name);
    this.name = info.name;
    this.home = info.home;
    this.prefix = info.prefix;
    this.root = info.root;
    this.dir = info.dir;
    this.path = info.path;
    this.type = 'application';
    this.services = frizione.service.setServices(this);
    this.refreshFiles();
}

/**
 * Default (main) action for the specified application.
 * See {@link frizione.macros.groupMainPage}.
 */
Application.prototype.main_action = function () {

    app.debug("Application Request " + req.path);

    if (req.data.action === "refresh") {
        app.debug("Application Request refresh file list");
        this.refreshFiles();
    }

    var data = {};
    data.jsJoinMinify = false;
    data.staticFiles = false;
    frizione.macros.groupMainPage(this, data);
};

/**
 * Refresh the application files list.
 */
Application.prototype.refreshFiles = function () {
    app.debug('Application ' + this.name + ' refresh files');
    var file = frizione.file(this.path);
    this.files = file.list([ '.css', '.js', '.json', '.html' ], null);
};

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the child element.
 */
Application.prototype.getChildElement = function (name) {
    app.debug("Application.getChildElement " + name);
    var service = this.services[name];
    if (service) {
        return service;
    }
    return this;
};