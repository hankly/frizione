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

/*globals res, crash, frizione */

if (!this.frizione.macros) {
    frizione.macros = {};
}

/**
 * Prepares and displays the group main page.
 *
 * @param {Application, Module, Project} group the group (application/module/project) object.
 * @param {Object} data the page data.
 */
frizione.macros.groupMainPage = function (group, data) {
    data.title = group.name + " : " + frizione.qualifiedVersion();
    data.group = group;
    data.head = "./head.html";
    data.body = "./group/body.html";
    var count = frizione.macros.groupFilesCount;
    data.cssJoinCount = count(group, [ ".join.css" ], null, "cssjoin");
    data.cssMinifyCount = count(group, [ ".min.css" ], null, "cssminify");
    data.jsJoinCount = count(group, [ ".join.js" ], null, "jsjoin");
    data.jsMinifyCount = count(group, [ ".min.js" ], null, "jsminify");
    data.jsTestCount = count(group, [ ".test.js" ], null, "jstest");
    data.jsLintCount = count(group, [ ".js" ], [ ".jsdoc.js", ".join.js", ".test.js", ".min.js" ], "jslint");
    data.jsDocCount = count(group, [ ".jsdoc.js" ], null, "jsdoc");
    data.jsonViewCount = count(group, [ ".json" ], [ ".test.json" ], "jsonview");
    data.jsonTestCount = count(group, [ ".test.json" ], null, "jsontest");
    data.htmlViewCount = count(group, [ ".html" ], null, "htmlview");

    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
};

/**
 * Produces a HTML fragment of the files count.
 *
 * @param {Application, Module, Project} group the group (application/module/project) object.
 * @param {Array} includes the includable file extensions (with leading dot), for example ".png".
 * @param {Array} excludes the excludable file extensions (with leading dot), for example ".exclude.png".
 * @param (String) action the anchor action, for example "jslint".
 * @return {String} the HTML fragment.
 */
frizione.macros.groupFilesCount = function (group, includes, excludes, action) {
    var result = frizione.group.filterList(group.files, includes, excludes);
    if (result.length > 0) {
        var units = result.length === 1 ? "file" : "files";
        return "<a href='/frizione/" + group.type + "s/" + group.dir + "/" + action + "'>" + result.length + " " + units + "</a>";
    }
    else {
        return "No files found";
    }
};