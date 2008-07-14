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
 * Default (main) action.
 */
function main_action() {

    app.debug("View Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 2) {
        var file = '/' + path.slice(2, path.length).join('/');
        if (this.type === 'html') {
            res.redirect(projectsMountPoint() + '/' + this.project.dir + file)
        }
        else {
            this.renderViewPage(file);
        }
    }
    else {
        switch (req.data.action) {
            case "refresh":
                app.debug("View Request refresh files list");
                this.project.refreshFiles();
                break;
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
    data.project = this.project;
    data.type = this.type;

    var typeName = 'JSON';
    data.explain = "Frizione will be delighted to display the following JSON files:";
    data.action = 'jsonview';
    data.includes = ".json";
    data.excludes = ".test.json";
    switch (this.type) {
        case 'html':
            typeName = "HTML";
            data.explain = "Frizione will cheerfully redirect you to the following HTML files:";
            data.action = 'htmlview';
            data.includes = ".html";
            data.excludes = null;
            break;
    }

    data.title = typeName + " View : " + this.project.name + " : " + qualifiedVersion();

    data.head = this.renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body');
    this.renderSkin('Layout');
}

/**
 * Renders the view page.
 *
 * @param file the JSON file to view.
 */
function renderViewPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = "JSON View : " + this.project.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.project = this.project;

    var text = fileutils.readText(this.project.path + file);
    data.file = '/' + this.project.dir + file;
    data.text = encode(text);

    data.head = this.renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body.View');
    this.renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("View.getChildElement " + name);
    return this;
}