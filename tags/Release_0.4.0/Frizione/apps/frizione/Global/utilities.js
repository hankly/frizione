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
 * Sets the services for a Project/Application/Module object.
 *
 * @param group the project/application/module object.
 * @return the services object.
 */
function setServices(group) {
    var services = { };
    services.jslint = new JsLint(group);
    services.jsonview = new View(group, 'json');
    services.htmlview = new View(group, 'html');
    services.cssjoin = new Join(group, 'css');
    services.jsjoin = new Join(group, 'js');
    services.cssminify = new Minify(group, 'css');
    services.jsminify = new Minify(group, 'js');
    services.jstest = new Test(group, 'js');
    services.jsontest = new Test(group, 'json');
    services.readfixture = new Fixture(group, 'read');
    services.writefixture = new Fixture(group, 'write');
    return services;
}

/**
 * Returns the directory of the specified group.
 *
 * @param group the project/application/module group.
 * @return the root directory of the group.
 */
function groupDir(group) {
    switch (group.type) {
        case 'application':
            return applicationsDir();
        case 'module':
            return modulesDir();
        default:
            return projectsDir();
    }
}

/**
 * Creates the current project/application/module file list.
 *
 * @param rootDir the directory to iterate.
 * @param creator the function to create a new group object.
 */
function createFileList(rootDir, creator) {
    var groups = {};
    var names = {};
    var list = [];
    var dirList = rootDir.listFiles();
    if (dirList) {
        for (var i = 0; i < dirList.length; i++) {
            var dir = dirList[i];
            if (dir.isDirectory()) {
                var name = dir.name;
                var lowerName = name.toLowerCase();
                if (lowerName !== "cvs" && lowerName !== ".svn") {
                    var infoFile = new java.io.File(dir.getCanonicalFile().toString() + FRIZIONE_FILE);
                    if (infoFile.exists() && infoFile.isFile()) {

                        var info = fileutils.readJson(infoFile.getCanonicalFile().toString());
                        info.dir = name;
                        info.path = dir.getCanonicalFile().toString();
                        list.push(info.name);

                        // Create a default jslint.json file if there isn't one
                        jslintOptions(info.path);

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