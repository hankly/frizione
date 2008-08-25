/*
Copyright (c) 2008 John Leach.

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
/*globals crash, frizione, java */

/**
 * Creates a file manipulation object.
 *
 * @param {String} path the file path.
 * @return {frizione.fileUtils} The file manipulation object.
 */
frizione.file = function (path) {

    /**
     * @class The file manipulation object.
     * This object is constructed via the {@link frizione.file} function.
     *
     * @name frizione.fileUtils
     */
    var functions = crash.file(path);

    /**
     * Creates the directory structure, including any necessary but nonexistent parent directories.
     *
     * @return {Boolean} true if the directory was created, otherwise false.
     * @name frizione.fileUtils#mkdirs
     * @function
     */
    functions.mkdirs = function () {
        var path = functions.file.getParentFile();
        return (path.exists() || path.mkdirs());
    };

    /**
     * Reads a JSON file.
     *
     * @return {Object} the JSON object.
     * @name frizione.fileUtils#readJson
     * @function
     */
    functions.readJson = function () {
        var text = functions.readText();
        return new Function("return (" + text + ");")();
    };

    /**
     * Writes a JSON file.
     *
     * @param {Object} data the JSON object.
     * @name frizione.fileUtils#writeJson
     * @function
     */
    functions.writeJson = function (data) {
        var result = JSON.stringify(data, null, "\t");
        functions.writeText(result);
    };

    /**
     * Gets the specified file type list.
     *
     * @param {Array} includes the includable file extensions array (with leading dot), for example ".png".
     * @param {Array} excludes the excludable file extensions array (with leading dot), for example ".exclude.png".
     * @return {Array} the file list.
     * @name frizione.fileUtils#list
     * @function
     */
    functions.list = function (includes, excludes) {
        var includesLength = includes ? includes.length : 0;
        var excludesLength = excludes ? excludes.length : 0;
        var results = [];

        function recursiveList(root, dir, results) {
            var fileList = new java.io.File(root).listFiles();
            var length = 0;
            var i = 0, j = 0, k = 0;
            var next = null;
            var name = null;
            var lowerName = null;
            var excluded = false;
            if (fileList) {
                length = fileList.length;
                for (i = 0; i < length; i += 1) {
                    next = fileList[i];
                    name = next.name;
                    lowerName = name.toLowerCase();
                    if (next.isDirectory()) {
                        if (name !== "." && name !== ".." && lowerName !== 'cvs' && lowerName !== '.svn') {
                            recursiveList(root + "/" + name, dir + "/" + name, results);
                        }
                    }
                    else {
                        excluded = false;
                        for (j = 0; j < includesLength; j += 1) {
                            if (lowerName.endsWith(includes[j])) {
                                excluded = false;
                                for (k = 0; k < excludesLength && !excluded; k += 1) {
                                    if (lowerName.endsWith(excludes[k])) {
                                        excluded = true;
                                    }
                                }
                                if (!excluded) {
                                    results.push(dir + "/" + name);
                                }
                            }
                        }
                    }
                }
            }
        }

        recursiveList(functions.file.toString(), "", results);
        return results.sort();
    };

    return functions;
};