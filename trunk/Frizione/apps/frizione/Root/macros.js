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
  * Macro that lists all projects.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the frizione.json file property, usually "name".</li>
  * </ul>
  * 
  * @param params invocation parameters.
  */
function projectsList_macro(params) {
    var type = (params && params.type) ? params.type : "name";
    var html = "";
    var list = app.data.projects.list;
    var names = app.data.projects.names;
    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var project = names[name];
        app.debug("project '" + name + "' list '" + project + "'");
        if (name && project[type]) {
            html += "<p><a href='" + '/frizione/projects/' + project.dir + "/'>" + name + "</a></p>";
        }
    }
    if (html === "") {
        return "<p>No projects found</p>";
    }
    return html;
}

/**
  * Macro that lists all applications.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the frizione.json file property, usually "name".</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function applicationsList_macro(params) {
    var type = (params && params.type) ? params.type : "name";
    var html = "";
    var list = app.data.applications.list;
    var names = app.data.applications.names;
    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var application = names[name];
        app.debug("application '" + name + "' list '" + application + "'");
        if (name && application[type]) {
            html += "<p><a href='" + '/frizione/applications/' + application.dir + "/'>" + name + "</a></p>";
        }
    }
    if (html === "") {
        return "<p>No applications found</p>";
    }
    return html;
}

/**
  * Macro that lists all modules.
  *
  * Parameters:
  * <ul>
  * <li><code>type</code> the frizione.json file property, usually "name".</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function modulesList_macro(params) {
    var type = (params && params.type) ? params.type : "name";
    var html = "";
    var list = app.data.modules.list;
    var names = app.data.modules.names;
    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var module = names[name];
        app.debug("module '" + name + "' list '" + module + "'");
        if (name && module[type]) {
            html += "<p><a href='" + '/frizione/modules/' + module.dir + "/'>" + name + "</a></p>";
        }
    }
    if (html === "") {
        return "<p>No modules found</p>";
    }
    return html;
}