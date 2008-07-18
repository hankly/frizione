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
 * Default (main) action for minify operations.
 */
function main_action() {

    app.debug("Minify Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        this.renderMinifyPage(file);
    }
    else {
        switch (req.data.action) {
            case "refresh":
                app.debug("Minify Request refresh files list");
                this.group.refreshFiles();
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
    data.group = this.group;
    data.type = this.type;

    var typeName = 'CSS';
    data.explain = "Frizione will be pleased to minify the following CSS files, though it might take a while:";
    data.action = 'cssminify';
    data.includes = ".min.css";
    data.excludes = null;
    switch (this.type) {
        case 'js':
            typeName = "JavaScript";
            data.explain = "Frizione will be pleased to minify the following JavaScript files, though it might take a while:";
            data.action = 'jsminify';
            data.includes = ".min.js";
            data.excludes = null;
            break;
    }

    data.title = typeName + " Minify : " + this.group.name + " : " + qualifiedVersion();

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body');
    renderSkin('Layout');
}

/**
 * Renders the minify page.
 *
 * @param file the minify file to execute.
 */
function renderMinifyPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();

    var typeName = 'CSS';
    data.back = "cssminify";
    data.backText = "CSS Minify";
    switch (this.type) {
        case 'js':
            typeName = "JavaScript";
            data.back = "jsminify";
            data.backText = "JavaScript Minify";
            break;
    }

    data.title = typeName + " Minify : " + this.group.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    data.file = file;
app.debug("Start join " + req.runtime);
    var result = services.join(this.group.path + file);
app.debug("Start services " + req.runtime);
    services.execute(file, result, 'minify', this.type, data, groupDir(this.group).toString() + '/' + this.group.dir);
app.debug("End services " + req.runtime);

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body.Minify');
    renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Minify.getChildElement " + name);
    return this;
}