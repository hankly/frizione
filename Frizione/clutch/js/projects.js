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
/*global clutch, Ajax, $ */

if (!this.clutch) {
    clutch = {};
}

/**
 * With the help of the server, grabs all the /projects metadata files,
 * and then lists the ones that have a definition for 'type'.
 * This is a decoupling mechanism so that clutch can live in its own
 * version control repository, and your code (in a /projects sub-directory) can live
 * in a different source control repository.
 * 
 * @param type the type to display, one of 'home', 'joins', 'jslint' or 'tests'.
 */
clutch.retrieveAndDisplay = function (type) {

    document.observe('dom:loaded', function() {
        var text = null;
        var request = new Ajax.Request('/run-projects', {
            method: 'get',
            parameters: { nocache: new Date().getTime() },
            onSuccess: function (transport) {
                var elem = $('projects');
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
                        text = "<span>No projects found</span>.";
                    }
                    elem.replace("<p>" + text + "</p>");
                }
                catch (ex) {
                    elem.replace("<p><span class='error'>" + ex.toString() + "</span></p>");
                    alert(ex.toString());
                }
            },
            onFailure: function () {
                var elem = $('projects');
                elem.replace("<p><span class='error'>Failed to retrieve the projects information.</span></p>");
                alert("Failed to retrieve the projects information.");
            }
        });
    });
};