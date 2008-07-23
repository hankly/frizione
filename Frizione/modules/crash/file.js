/*
Copyright (c) 2008 The Crash Team.

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
/*globals crash, java */

if (!this.crash) {
    crash = {};
}

/**
 * File manipulation.
 *
 * @param {String} path the file path.
 */
crash.File = function (path) {
    var file = new java.io.File(path).getAbsoluteFile();

    /**
     * Tests whether the file or directory exists.
     *
     * @return {Boolean} true if the file or directory exists, otherwise false.
     */
    this.exists = function () {
        return file.exists();
    };

    /**
     * Checks if the file is a directory.
     *
     * @return {Boolean} true if exists and is a directory, otherwise false.
     */
    this.isDirectory = function () {
        return file.isDirectory();
    };

    /**
     * Checks if the file is a normal file.
     *
     * @return (Boolean) true if exists and is a normal file, otherwise false.
     */
    this.isFile = function () {
        return file.isFile();
    };

    /**
     * Checks if the file can be read.
     *
     * @return {Boolean} true if the file exists and can be read, otherwise false.
     */
    this.canRead = function () {
        return file.canRead();
    };

    /**
     * Checks if the file can be written.
     *
     * @return {Boolean} true if the file exists and can be written, otherwise false.
     */
    this.canWrite = function () {
        return file.canWrite();
    };

    /**
     * Gets the file size in bytes.
     *
     * @return {Number} the size in bytes, or 0L if the file does not exist.
     * @type Number
     */
    this.size = function () {
        return file.length();
    };

    /**
     * Returns the time when the file was last modified.
     *
     * @return {Number} the last modified time in milliseconds since 00:00:00 GMT, January 1, 1970.
     */
    this.lastModified = function () {
        return file.lastModified();
    };

    /**
     * Lists the files and directories.
     *
     * @param {Function} receiver the function that receives each file or directory.
     */
    this.each = function (receiver) {
        var fileList = file.listFiles();
        var length = 0;
        var i = 0;
        var next = null;
        var name = null;
        if (fileList) {
            length = fileList.length;
            for (i = 0; i < length; i += 1) {
                next = fileList[i];
                name = next.name;
                if (next.isDirectory()) {
                    if (name !== "." && name !== "..") {
                        receiver(next);
                    }
                }
                else {
                    receiver(next);
                }
            }
        }
    };

    /**
     * Creates the directory structure, including any necessary but nonexistent parent directories.
     *
     * @return {Boolean} true if the directory was created, otherwise false.
     */
    this.mkdirs = function () {
        return (file.exists() || file.mkdirs());   
    };

    /**
     * Reads the entire binary contents of the file.
     *
     * @return {Byte[]} the contents as a byte array, or null if the file doesn't exist.
     */
    this.readBinary = function () {
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
        return null;
    };

    /**
     * Reads the entire text contents of the file.
     *
     * @param {String} charset the character set to use (defaults to "UTF-8").
     * @return {String} the contents of the text file, or null if the file doesn't exist.
     */
    this.readText = function (charset) {
        if (file.isFile() && file.exists()) {

            var reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(path), charset || "UTF-8"));
            var lines = [];
            while (true) {
                var line = reader.readLine();
                if (line === null) {
                    break;
                }
                lines.push(line);
            }
            reader.close();
            return lines.join('\n');
        }
        return null;
    };

    /**
     * Reads the entire JSON contents of the file.
     *
     * @return the JSON object, or null if the file doesn't exist.
     */
    this.readJson = function () {
        var text = this.readText();
        if (text) {
            return new Function("return (" + text + ");")();
        }
        return null;
    };

    /**
     * Writes the entire contents of a text file.
     *
     * @param {String} data the file contents.
     * @param {String} charset the character set to use (defaults to "UTF-8").
     */
    this.writeText = function (data, charset) {
        var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(file), charset || "UTF-8"));
        writer.write(data);
        writer.close();
        writer = null;
    };

    /**
     * Renames the file.
     *
     * @param {String} name the name of the new file.
     * @return {Boolean} true if the renaming succeeded, otherwise false.
     */
    this.renameTo = function (name) {
        var to = new java.io.File(name);
        var result = file.renameTo(to.getAbsolutePath());
        if (result) {
            file = new java.io.File(name).getAbsoluteFile();
        }
        return result;
    };

    /**
     * Makes a copy of the file.
     *
     * @param {String} dest the file to be copied to.
     * @return {Boolean} true if the copy succeeded, otherwise false.
     */
    this.copy = function (dest) {
        // See: http://www.mozilla.org/rhino/ScriptingJava.html
        var from = new java.io.BufferedInputStream(new java.io.FileInputStream(file));
        var to = new java.io.BufferedOutputStream(new java.io.FileOutputStream(dest));
        var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
        var bytesRead = 0;

        try {
            while ((bytesRead = from.read(buffer, 0, buffer.length)) > -1) {
                to.write(buffer, 0, bytesRead);
            }
        }
        catch (e) {
            return false;
        }
        finally {
            from.close();
            to.close();
        }
        return true;
    };

    /**
     * Moves a file to a new destination.
     *
     * @param {String} dest the destination file name.
     * @return {Boolean} true in case file could be moved, otherwise false.
     */
    this.move = function (dest) {
        if (!file.copy(dest)) {
            return false;
        }
        if (!file["delete"]()) {
            return false;
        }
        file = new java.io.File(dest).getAbsoluteFile();
        return true;
    };

    /**
     * Removes (deletes) the file or directory.
     *
     * @return {Boolean} true if the file was removed, otherwise false.
     */
    this.remove = function() {
       return file["delete"]();
    };
};