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

fileutils = {

    /**
     * Make the complete directory path.
     *
     * @param path the complete file path.
     * @return true if successful, otherwise false.
     */
    makeDirs: function (path) {
        var pathDirs = path.replace('\\', '/').split('/');
        if (pathDirs && pathDirs.length > 1) {
            path = pathDirs.slice(0, pathDirs.length - 1).join('/');
            return new java.io.File(path).mkdirs();
        }
        return true;
    },

    /**
     * Reads the entire contents of a binary file.
     *
     * @param path the file path.
     * @return the contents as a byte array.
     */
    readBinary: function (path) {
        var file = new java.io.File(path);
        if (file.isFile() && file.exists()) {

            // See: http://www.mozilla.org/rhino/ScriptingJava.html
            var stream = new java.io.FileInputStream(file);
            var length = file.length();
            var binaryBuffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length);
            var offset = 0;
            while (offset < binaryBuffer.length) {
                var numRead = stream.read(binaryBuffer, offset, binaryBuffer.length - offset);
                if (numRead < 0) {
                    break;
                }
                offset += numRead;
            }
            stream.close();
            stream = null;
            return binaryBuffer;
        }
        throw new Error("File " + file.getCanonicalFile() + " doesn't exist, or isn't a file");
    },

    /**
     * Reads the entire contents of a text file.
     *
     * @param path the file path.
     * @param charset the character set to use (defaults to "UTF-8").
     * @return the contents as a String.
     */
    readText: function (path, charset) {
        var file = new java.io.File(path);
        if (file.isFile() && file.exists()) {

            var length = file.length();
            var reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(path), charset || "UTF-8"));
            // var textBuffer = new java.lang.StringBuffer(length + 10);
            var lines = [];
            while (true) {
                var line = reader.readLine();
                if (line == null) {
                    break;
                }
                //if (textBuffer.length() > 0) {
                //    textBuffer.append('\n');
                //}
                //textBuffer.append(line);
                lines.push(line);
            }
            reader.close();
            //return String(textBuffer);
            return lines.join('\n');
        }
        throw new Error("File " + file.getCanonicalFile() + " doesn't exist, or isn't a file");
    },

    /**
     * Writes the entire contents of a text file.
     *
     * @param path the file path.
     * @param data the file contents.
     * @param charset the character set to use (defaults to "UTF-8").
     */
    writeText: function (path, data, charset) {
        var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(path), charset || "UTF-8"));
        writer.write(data);
        writer.close();
        writer = null;
    },

    /**
     * Checks if the specified file path exists and is a file.
     *
     * @param path the file path to check.
     * @return true if an existing file, otherwise false.
     */
    exists: function (path) {
        var file = new java.io.File(path);
        return file.isFile() && file.exists();
    },

    /**
     * Gets the last modified time of a file or directory in milliseconds since the epoch
     * (00:00:00 GMT, January 1, 1970), or 0L if the file does not exist or if an I/O error occurs.
     *
     * @param path the file path to check.
     * @return the last modified time.
     */
    lastModified: function (path) {
        return new java.io.File(path).lastModified();
    },

    /**
     * Reads a JSON file.
     *
     * @param path the JSON file path.
     * @return the JSON object.
     */
    readJson: function (path) {
        var text = this.readText(path);
        return new Function("return (" + text + ");")();
    },

    /**
     * Writes a JSON file.
     *
     * @param path the JSON file path.
     * @param data the stringified JSON contents.
     */
    writeJson: function (path, data) {
        this.writeText(path, data);
    },

    /**
     * Gets the specified file type list recursively.
     *
     * @param root the root directory.
     * @param includes the includable file extensions array (with leading dot), for example ".png".
     * @param excludes the excludable file extensions array (with leading dot), for example ".exclude.png".
     * @param dir the relative directory.
     * @param results the list results.
     * @return the file list.
     */
    list: function (root, includes, excludes, dir, results) {
        var includesLength = includes.length;
        var excludesLength = excludes ? excludes.length : 0;
        var dirList = new java.io.File(root).listFiles();
        if (dirList) {
            for (var i = 0; i < dirList.length; i += 1) {
                var file = dirList[i];
                var name = file.name;
                var lowerName = name.toLowerCase();
                if (file.isDirectory()) {
                    if (name !== "." && name !== ".." && lowerName !== 'cvs' && lowerName !== '.svn') {
                        this.list(root + "/" + name, includes, excludes, dir + "/" + name, results);
                    }
                }
                else {
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
                                results.push(dir + "/" + name);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * Gets the specified file type list.
     *
     * @param root the root directory.
     * @param includes the includable file extensions array (with leading dot), for example ".png".
     * @param excludes the excludable file extensions array (with leading dot), for example ".exclude.png".
     * @return the file list.
     */
    listAll: function (root, includes, excludes) {
        var results = [];
        this.list(root, includes, excludes, "", results);
        return results.sort();
    },

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