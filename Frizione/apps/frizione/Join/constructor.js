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

/*global app, req, res, crash, frizione*/

/**
 * Join object constructor.
 *
 * @class Join
 * @constructor
 * @param group the project/application/module object.
 * @param type the join type, either 'css' or 'js'.
 */
function constructor(group, type) {
    app.debug('Join ' + type + ": " + group.type + ": " + group.name);
    this.group = group;
    this.type = type;
    if (type === 'js') {
        this.explain = "Frizione will be thrilled to join (concatenate) the following JavaScript files, though it might take a while:";
        this.typeName = "JavaScript";
        this.service = "jsjoin";
        this.serviceText = "JavaScript Join";
        this.includes = [ ".join.js" ];
        this.excludes = null;
    }
    else {
        this.explain = "Frizione will be thrilled to join (concatenate) the following CSS files, though it might take a while:";
        this.typeName = 'CSS';
        this.service = "cssjoin";
        this.serviceText = "CSS Join";
        this.includes = [ ".join.css" ];
        this.excludes = null;
    }
}

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
        if (req.data.action === "refresh") {
            app.debug("Join Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
}

/**
 * Renders the join page.
 *
 * @param file the join file to execute.
 */
function renderJoinPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./service/result.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var result = frizione.service.join(this.group.prefix + '/' + this.group.dir + '/' + file);
    frizione.service.execute(file, result, 'join', this.type, data, this.group.prefix + '/' + this.group.dir);
    data.reportTitle = frizione.macros.commandTitleReport('join', data);
    data.report = frizione.macros.commandReport('join', data);
    
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
    app.debug("Join.getChildElement " + name);
    return this;
}