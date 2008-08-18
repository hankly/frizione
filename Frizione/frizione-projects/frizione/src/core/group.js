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

/*globals app, frizione, java */
/*globals Application, Module, Project */
/*globals FRIZIONE_FILE, JSLINT_OPTIONS_FILE */

frizione.group = {

    /**
     * Gets the Helma applications directory prefix.
     *
     * @return {String} the directory prefix.
     */
    applicationsPrefix: function () {
        return 'apps';
    },

    /**
     * Gets the Helma applications directory.
     *
     * @return {File} the directory.
     */
    applicationsDir: function () {
        return new java.io.File(app.getServerDir() + '/' + frizione.group.applicationsPrefix).getAbsoluteFile();
    },

    /**
     * Gets the Helma modules prefix.
     *
     * @return {String} the directory prefix.
     */
    modulesPrefix: function () {
        return 'modules';
    },

    /**
     * Gets the Helma modules directory.
     *
     * @return {File} the directory.
     */
    modulesDir: function () {
        return new java.io.File(app.getServerDir() + '/' + frizione.group.modulesPrefix).getAbsoluteFile();
    },

    /**
     * Gets the frizione projects prefix.
     *
     * @return {String} the directory prefix.
     */
    projectsPrefix: function () {
        var props = app.getAppsProperties();
        return props['frizione.static'] || 'frizione-projects';
    },

    /**
     * Gets the frizione projects directory.
     *
     * @return {File} the directory.
     */
    projectsDir: function () {
        return new java.io.File(app.getServerDir() + '/' + frizione.group.projectsPrefix).getAbsoluteFile();
    },

    /**
     * Gets the frizione projects mountpoint
     *
     * @return {String} the mountpoint.
     */
    projectsMountPoint: function () {
        var props = app.getAppsProperties();
        return props['frizione.staticMountpoint'] || '/projects';
    },

    /**
     * Gets the current applications list.
     *
     * @param {boolean} refresh refresh list flag (default is false).
     * @return {Array} the applications list.
     */
    allApplications: function (refresh) {
        if (!refresh) {
            if (app.data.applications) {
                return app.data.applications;
            }
        }
        app.debug("Creating applications list");
        app.data.applications = frizione.group.createGroupList(frizione.group.applicationsPrefix(), function (info) {
            return new Application(info);
        }, false);
        return app.data.applications;
    },

    /**
     * Gets the current modules list.
     *
     * @param {boolean} refresh refresh list flag (default is false).
     * @return {Array} the modules list.
     */
    allModules: function (refresh) {
        if (!refresh) {
            if (app.data.modules) {
                return app.data.modules;
            }
        }
        app.debug("Creating modules list");
        app.data.modules = frizione.group.createGroupList(frizione.group.modulesPrefix(), function (info) {
            return new Module(info);
        }, false);
        return app.data.modules;
    },

    /**
     * Gets the current project list.
     *
     * @param {boolean} refresh refresh list flag (default is false).
     * @return {Array} the project list.
     */
    allProjects: function (refresh) {
        if (!refresh) {
            if (app.data.projects) {
                return app.data.projects;
            }
        }
        app.debug("Creating projects list");
        app.data.projects = frizione.group.createGroupList(frizione.group.projectsPrefix(), function (info) {
            return new Project(info);
        }, true);
        return app.data.projects;
    },

    /**
     * Creates the current group (project/application/module) file list.
     *
     * @param {String} prefix the Helma directory to iterate.
     * @param {Function} creator the function to create a new group object.
     * @param {boolean} browser true if a browser project, false if a rhino project.
     * @return {Object} the group file list.
     */
    createGroupList: function (prefix, creator, browser) {
        var groups = {};
        var names = {};
        var list = [];
        var root = new java.io.File(app.getServerDir() + '/' + prefix).getAbsoluteFile();
        var rootList = root.listFiles();
        if (rootList) {
            for (var i = 0; i < rootList.length; i += 1) {
                var dir = rootList[i];
                if (dir.isDirectory()) {
                    var name = dir.name;
                    var lowerName = name.toLowerCase();
                    if (lowerName !== "cvs" && lowerName !== ".svn") {
                        var infoFile = frizione.file(dir.getAbsoluteFile().toString() + FRIZIONE_FILE);
                        if (infoFile.exists() && infoFile.isFile()) {

                            var info = infoFile.readJson();
                            info.prefix = prefix;
                            info.root = root.toString();
                            info.dir = name;
                            info.path = dir.getAbsoluteFile().toString();
                            list.push(info.name);

                            // Create a default jslint.json file if there isn't one
                            frizione.group.jsLintOptions(info.path, browser);

                            app.debug("Storing group[" + name + "], groupNames[" + info.name + "]");
                            var group = creator(info);
                            groups[name] = group;
                            names[info.name] = group;
                        }
                    }
                }
            }
        }

        list.sort();
        return { list: list, names: names, groups: groups };
    },

    /**
     * Filters a files list.
     *
     * @param {Array} list the files list.
     * @param {Array} includes the includable file extensions (with leading dot), for example ".png".
     * @param {Array} excludes the excludable file extensions (with leading dot), for example ".exclude.png".
     * @return {Array} the filtered (and sorted) files list.
     */
    filterList: function (list, includes, excludes) {
        var results = [];
        var includesLength = includes ? includes.length : 0;
        var excludesLength = excludes ? excludes.length : 0;
        for (var i = 0; i < list.length; i += 1) {
            var file = list[i];
            var lowerName = file.toLowerCase();
            var excluded = false;
            var j = 0, k = 0;
            for (j = 0; j < includesLength; j += 1) {
                if (lowerName.endsWith(includes[j])) {
                    excluded = false;
                    for (k = 0; k < excludesLength && !excluded; k += 1) {
                        if (lowerName.endsWith(excludes[k])) {
                            excluded = true;
                        }
                    }
                    if (!excluded) {
                        results.push(file);
                    }
                }
            }
        }
        return results.sort();
    },

    /**
     * Gets the JSLint options from the specified path.
     *
     * @param {String} path the project file path.
     * @param {boolean} browser (optional) true if a browser project, false if a rhino project.
     * @return {Object} the JSLint options object.
     */
    jsLintOptions: function (path, browser) {
        var file = frizione.file(path + JSLINT_OPTIONS_FILE);

        function defaultJsLintOptions() {
            return {
                adsafe     : false, // if ADsafe should be enforced
                bitwise    : true,  // if bitwise operators should not be allowed
                browser    : true,  // if the standard browser globals should be predefined
                cap        : false, // if upper case HTML should be allowed
                debug      : false, // if debugger statements should be allowed
                eqeqeq     : true,  // if === should be required
                evil       : false, // if eval should be allowed
                forin      : false, // if for in statements must filter
                fragment   : false, // if HTML fragments should be allowed
                glovar     : true,  // if global variables are not allowed
                laxbreak   : false, // if line breaks should not be checked
                nomen      : true,  // if names should be checked
                on         : false, // if HTML event handlers should be allowed
                passfail   : false, // if the scan should stop on first error
                plusplus   : true,  // if increment/decrement should not be allowed
                regexp     : false, // if the . should not be allowed in regexp literals
                rhino      : false, // if the Rhino environment globals should be predefined
                undef      : true,  // if variables should be declared before used
                sidebar    : false, // if the System object should be predefined
                white      : false, // if strict whitespace rules apply
                widget     : false  // if the Yahoo Widgets globals should be predefined
            };
        }

        if (!file.exists()) {
            var jsLintOptions = defaultJsLintOptions();
            if (typeof browser !== 'undefined' && browser === false) {
                jsLintOptions.browser = false;
                jsLintOptions.rhino = true;
            }
            file.writeJson(JSON.stringify(jsLintOptions, null, "\t"));
            return jsLintOptions;
        }
        else {
            return file.readJson();
        }
    },

    /**
     * Gets the application by directory name.
     *
     * @param {String} dir the directory name.
     * @return {Application} the Application object.
     */
    applicationByDir: function (dir) {
        frizione.group.allApplications();
        return app.data.applications.groups[dir];
    },

    /**
     * Gets the module by directory name.
     *
     * @param {String} dir the directory name.
     * @return {Module} the Module object.
     */
    moduleByDir: function (dir) {
        frizione.group.allModules();
        return app.data.modules.groups[dir];
    },

    /**
     * Gets the project by directory name.
     *
     * @param dir the directory name.
     * @return {Project} the Project object.
     */
    projectByDir: function (dir) {
        frizione.group.allProjects();
        return app.data.projects.groups[dir];
    }
};