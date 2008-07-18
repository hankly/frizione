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
        switch (req.data.action) {
            case "refresh":
                app.debug("JsLint Request refresh files list");
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

    data.title = "JSLint : " + this.group.name + " : " + qualifiedVersion();

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body');
    renderSkin('Layout');
}

/**
 * Renders the lint page.
 *
 * @param file the JavaScript file to lint.
 */
function renderLintPage(file) {
    res.charset = "UTF8";

    var data = res.data;
    data.root = root.href();
    data.href = this.href();
    data.title = "JSLint : " + this.group.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    var text = fileutils.readText(this.group.path + file);
    data.file = file;
    data.text = encode(text);
    var options = jslintOptions(this.group.path);
    data.options = options;
    data.result = JSLINT(text, options);
    data.errors = JSLINT.errors;
    data.report = JSLINT.report();

    data.head = renderSkinAsString('Head');
    data.body = this.renderSkinAsString('Body.Lint');
    renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("JsLint.getChildElement " + name);
    return this;
}