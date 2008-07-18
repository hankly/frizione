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
 * Default (main) action for join operations.
 */
function main_action() {

    app.debug("Join Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        this.renderJoinPage(file);
    }
    else {
        switch (req.data.action) {
            case "refresh":
                app.debug("Join Request refresh files list");
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
    res.data.root = root.href();
    res.data.href = this.href();
    res.data.group = this.group;
    res.data.type = this.type;

    var typeName = 'CSS';
    res.data.explain = "Frizione will be thrilled to join (concatenate) the following CSS files, though it might take a while:";
    res.data.action = 'cssjoin';
    res.data.includes = ".join.css";
    res.data.excludes = null;
    switch (this.type) {
        case 'js':
            typeName = "JavaScript";
            res.data.explain = "Frizione will be trilled to join (concatenate) the following JavaScript files, though it might take a while:";
            res.data.action = 'jsjoin';
            res.data.includes = ".join.js";
            res.data.excludes = null;
            break;
    }

    res.data.title = typeName + " Join : " + this.group.name + " : " + qualifiedVersion();

    res.data.head = renderSkinAsString('Head');
    res.data.body = this.renderSkinAsString('Body');
    renderSkin('Layout');
}

/**
 * Renders the join page.
 *
 * @param file the join file to execute.
 */
function renderJoinPage(file) {
    res.charset = "UTF8";
    var data = res.data;
    data.root = root.href();
    data.href = this.href();

    var typeName = 'CSS';
    data.back = "cssjoin";
    data.backText = "CSS Join";
    switch (this.type) {
        case 'js':
            typeName = "JavaScript";
            data.back = "jsjoin";
            data.backText = "JavaScript Join";
            break;
    }

    data.title = typeName + " Join : " + this.group.name + " : " + qualifiedVersion();
    data.version = qualifiedVersion();
    data.group = this.group;

    data.file = '/' + this.group.dir + file;
app.debug("Start join " + req.runtime);
    var result = services.join(this.group.path + file);
app.debug("Start services " + req.runtime);
    services.execute(file, result, 'join', this.type, data, groupDir(this.group).toString() + '/' + this.group.dir);
app.debug("End services " + req.runtime);

    res.data.head = renderSkinAsString('Head');
    res.data.body = this.renderSkinAsString('Body.Join');
    renderSkin('Layout');
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Join.getChildElement " + name);
    return this;
}