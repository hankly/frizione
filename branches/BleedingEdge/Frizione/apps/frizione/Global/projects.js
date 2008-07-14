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
 * Gets the clutch projects canonical directory
 *
 * @return the canonical directory.
 */
function projectsDir() {
    var props = app.getAppsProperties();
    var dir = props['frizione.static'] || 'frizione-projects';
    return new java.io.File(app.getServerDir() + '/' + dir).getCanonicalFile();
}

/**
 * Gets the clutch projects mountpoint
 *
 * @return the mountpoint.
 */
function projectsMountPoint() {
    var props = app.getAppsProperties();
    return props['frizione.staticMountpoint'] ||'/projects';
}

/**
 * Gets the current project list.
 *
 * @param refresh refresh list flag (default is false).
 * @return the project list.
 */
function allProjects(refresh) {
    if (!refresh) {
        if (app.data.projects) {
            return app.data.projects;
        }
    }
    var projects = {};
    var names = {};
    var list = [];
    var dirList = projectsDir().listFiles();
    if (dirList) {
        for (var i = 0; i < dirList.length; i++) {
            var dir = dirList[i];
            if (dir.isDirectory()) {
                var name = dir.name;
                var lowerName = name.toLowerCase();
                if (lowerName !== "cvs" && lowerName !== ".svn") {
                    var infoFile = new java.io.File(dir.getCanonicalFile().toString() + PROJECT_FILE);
                    if (infoFile.exists() && infoFile.isFile()) {

                        var info = fileutils.readJson(infoFile.getCanonicalFile().toString());
                        info.dir = name;
                        info.path = dir.getCanonicalFile().toString();
                        list.push(info.name);

                        // Create a default jslint.json file if there isn't one
                        jslintOptions(info.path);

                        app.debug("Storing projects[" + name + "], projectNames[" + info.name + "]");
                        var project = new Project(info);
                        projects[name] = project;
                        names[info.name] = project;
                    }
                }
            }
        }
    }

    list.sort();
    return app.data.projects = { list: list, names: names, projects: projects };
}

/**
 * Gets the project by directory name.
 *
 * @param dir the directory name.
 */
function projectByDir(dir) {
    allProjects();
    return app.data.projects.projects[dir];
}

/**
 * Gets the JSLint options from the specified path.
 *
 * @param path the project file path.
 * @return the JSLint options object.
 */
function jslintOptions(path) {
    var jslintFile = new java.io.File(path + JSLINT_OPTIONS_FILE);
    if (!jslintFile.exists()) {
        var jslintOptions = services.defaultJslintOptions();
        fileutils.writeJson(path + JSLINT_OPTIONS_FILE, JSON.stringify(jslintOptions, null, "\t"));
        return jslintOptions;
    }
    else {
        return fileutils.readJson(path + JSLINT_OPTIONS_FILE);
    }
}