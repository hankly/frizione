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
 * Default (main) action for the frizione application.
 */
function main_action() {

    app.debug("Main Request " + req.path);

    switch (req.data.action) {
        case "refreshprojects":
            app.debug("Main Request refresh project list");
            allProjects(true);
            break;
        case "refreshapplications":
            app.debug("Main Request refresh application list");
            allApplications(true);
            break;
        case "refreshmodules":
            app.debug("Main Request refresh modules list");
            allProjects(true);
            break;
    }
    this.renderMainPage();
}

/**
 * Renders the main page.
 */
function renderMainPage() {
    res.charset = "UTF-8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = qualifiedVersion();

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body');
    renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Root.getChildElement " + name);
    var files = app.data.dirs[name];
    if (files) {
        return files;
    }
    return projectByDir(name) || this;
}