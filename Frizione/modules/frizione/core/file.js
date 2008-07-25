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

if (!this.frizione) {
    frizione = {};
}

frizione.file = function (path) {

    var functions = crash.file(path);
    var file = functions.file;

    /**
     * Creates the directory structure, including any necessary but nonexistent parent directories.
     *
     * @return {Boolean} true if the directory was created, otherwise false.
     */
    functions.mkdirs = function () {
        var path = new java.io.File(file.parent()).getAbsoluteFile();
        return (path.exists() || path.mkdirs());
    };

    /**
     * Reads a JSON file.
     *
     * @return {Object} the JSON object.
     */
    functions.readJson = function () {
        var text = functions.readText(path);
        return new Function("return (" + text + ");")();
    };

    /**
     * Writes a JSON file.
     *
     * @param {Object} data the JSON object.
     */
    functions.writeJson = function (data) {
        var result = JSON.stringify(data, null, "\t");
        functions.writeText(data);
    };

    /**
     * Gets the specified file type list.
     *
     * @param {Array} includes the includable file extensions array (with leading dot), for example ".png".
     * @param {Array} excludes the excludable file extensions array (with leading dot), for example ".exclude.png".
     * @return {Array} the file list.
     */
    functions.list  function (includes, excludes) {
        var results = [];

        list(root, includes, excludes, "", results);
        return results.sort();
    };

    /**
     * Filters a files list.
     *
     * @param list the files list.
     * @param includes the includable file extensions (with leading dot), for example ".png".
     * @param excludes the excludable file extensions (with leading dot), for example ".exclude.png".
     * @return the filtered (and sorted) files list.
     */
    filterList: function (list, includes, excludes) {
        var results = [];
        var includesLength = includes.length;
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
     * Creates a Threadable stream writer - needed for Java's Runtime.exec().
     *
     * @param stream the output stream.
     * @param name the stream name.
     * @param data the text data to send.
     */
    processStreamWriter: function (stream, name, data) {
        var streamWriter = {

            name: name,

            writer: new java.io.BufferedWriter(new java.io.OutputStreamWriter(stream, 'UTF-8')),

            run: function () {
                streamWriter.writer.write(data);
                streamWriter.writer.close();
            }
        };
        return streamWriter;
    },

    /**
     *  Creates a Threadable stream reader - needed for Java's Runtime.exec().
     *
     * @param stream the input stream.
     * @param name the stream name.
     */
    processStreamReader: function (stream, name) {

        var streamReader = {

            name: name,

            reader: new java.io.BufferedReader(new java.io.InputStreamReader(stream, 'UTF-8')),

            buffer: new java.lang.StringBuffer(1024),

            run: function () {
                while (true) {
                    var line = streamReader.reader.readLine();
                    if (line == null) {
                        break;
                    }
                    if (streamReader.buffer.length() > 0) {
                        streamReader.buffer.append('\n');
                    }
                    streamReader.buffer.append(line);
                }
                streamReader.reader.close();
            }
        };
        return streamReader;
    }
};