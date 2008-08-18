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

/*globals app, res, req, java, crash, frizione */
/*globals HopObject, StaticFiles */
/*globals FRIZIONE_FILE, JSLINT_OPTIONS_FILE */

app.addRepository('modules/crash/core/helma/loader.js');

crash.load("crash/core/");
crash.load("crash/template/");
crash.load("crash/third-party/");
crash.load("crash/unit-test/");
crash.load("crash/xml/");

crash.load("frizione/core/version.js");
crash.load("frizione/core/");
crash.load("frizione/macros/");
crash.load("frizione/third-party/jsdoc-toolkit.js");

FRIZIONE_FILE = "/frizione.json";
JSLINT_OPTIONS_FILE = "/jslint.options.json";

/**
 * Application initialisation.
 *
 * @param name - the name of the application.
 */
function onStart(name) {
    var dirs = { };
    var staticDir = new java.io.File('./apps/frizione/StaticFiles').getAbsoluteFile().toString();
    dirs.css = new StaticFiles('css', staticDir);
    dirs.docs = new StaticFiles('docs', new java.io.File('../').getAbsoluteFile().toString());
    dirs.imgs = new StaticFiles('imgs', staticDir);
    dirs.js =  new StaticFiles('js', staticDir);

    dirs.applications = new HopObject();
    dirs.applications.main_action = function () {
        res.redirect('/frizione/');
    };
    dirs.applications.getChildElement = function (name) {
        app.debug("Applications.getChildElement " + name);
        return frizione.group.applicationByDir(name) || this;
    };
    dirs.modules = new HopObject();
    dirs.modules.main_action = function () {
        res.redirect('/frizione/');
    };
    dirs.modules.getChildElement = function (name) {
        app.debug("Modules.getChildElement " + name);
        return frizione.group.moduleByDir(name) || this;
    };
    dirs.projects = new HopObject();
    dirs.projects.main_action = function () {
        res.redirect('/frizione/');
    };
    dirs.projects.getChildElement = function (name) {
        app.debug("Projects.getChildElement " + name);
        return frizione.group.projectByDir(name) || this;
    };
    app.data.dirs = dirs;

    frizione.group.allApplications();
    frizione.group.allModules();
    frizione.group.allProjects();
}