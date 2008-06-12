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

/*jslint evil: true */
/*global clutch, Ajax */
/*members Request, clutch, each, evalJSON, getElementById, getTime,
    innerHTML, method, name, nocache, observe, onFailure, onSuccess,
    parameters, responseText, retrieveAndDisplay, toString */

if (!this.clutch) {
    clutch = {};
}

clutch.retrieveAndDisplay = function (type) {

    document.observe('dom:loaded', function() {
        var text = null;
        var request = new Ajax.Request('/run-projects', {
            method: 'get',
            parameters: { nocache: new Date().getTime() },
            onSuccess: function (transport) {
                var projects = document.getElementById('projects');
                try {
                    var result = transport.responseText.evalJSON(true);
                    text = "<ul>";
                    result.each(function (project) {
                        var name = project.name;
                        var link = project[type];
                        if (name && link) {
                            text += "<li><a href='" + link + "'>" + name + "</a></li>";
                        }
                    });
                    text += "</ul>";
                    if (text === "<ul></ul>") {
                        text = "<ul><li>No projects found.</li></ul>";
                    }
                    projects.innerHTML = text;
                }
                catch (ex) {
                    projects.innerHTML = "<ul><li>" + ex.toString() + "</li></ul>";
                    alert(ex.toString());
                }
            },
            onFailure: function () {
                var projects = document.getElementById('projects');
                projects.innerHTML = "<ul><li>Failed to retrieve the projects information.</li><ul>";
                alert("Failed to retrieve the projects information.");
            }
        });
    });
};
