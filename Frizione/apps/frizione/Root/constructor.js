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

/*globals app, res, req, crash, frizione */

/**
 * Default (main) action for the frizione application.
 */
function main_action() {
    app.debug("Main Request " + req.path);

    switch (req.data.action) {
        case "refreshprojects":
            app.debug("Main Request refresh project list");
            frizione.group.allProjects(true);
            break;
        case "refreshapplications":
            app.debug("Main Request refresh application list");
            frizione.group.allApplications(true);
            break;
        case "refreshmodules":
            app.debug("Main Request refresh modules list");
            frizione.group.allModules(true);
            break;
    }

    function createList(type, data) {
        var html = "";
        var list = data.list;
        var names = data.names;
        for (var i = 0; i < list.length; i += 1) {
            var name = list[i];
            var group = names[name];
            if (name && group.name) {
                html += "            <p><a href='" + '/frizione/' + type + 's/' + group.dir + "/'>" + name + "</a></p>\n";
            }
        }
        if (html === "") {
            return "            <p>No " + type + "s found</p>\n";
        }
        return html;
    }

    var data = {};
    data.title = frizione.qualifiedVersion();
    data.head = "./head.html";
    data.body = "./body.html";
    data.applications = createList("application", app.data.applications);
    data.modules = createList("module", app.data.modules);
    data.projects = createList("project", app.data.projects);

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
    app.debug("Root.getChildElement " + name);
    var files = app.data.dirs[name];
    return files || this;
}