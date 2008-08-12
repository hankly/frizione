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

/**
 * File manipulation functions.
 *
 * @param {String} path the file path.
 */
crash.file = function (path) {

    var result = {

        file: new java.io.File(path).getAbsoluteFile(),

        /**
         * Tests whether the file or directory exists.
         *
         * @return {Boolean} true if the file or directory exists, otherwise false.
         */
        exists: function () {
            return result.file.exists();
        },

        /**
         * Checks if the file is a directory.
         *
         * @return {Boolean} true if exists and is a directory, otherwise false.
         */
        isDirectory: function () {
            return result.file.isDirectory();
        },

        /**
         * Checks if the file is a normal file.
         *
         * @return (Boolean) true if exists and is a normal file, otherwise false.
         */
        isFile: function () {
            return result.file.isFile();
        },

        /**
         * Checks if the file can be read.
         *
         * @return {Boolean} true if the file exists and can be read, otherwise false.
         */
        canRead: function () {
            return result.file.canRead();
        },

        /**
         * Checks if the file can be written.
         *
         * @return {Boolean} true if the file exists and can be written, otherwise false.
         */
        canWrite: function () {
            return result.file.canWrite();
        },

        /**
         * Gets the file size in bytes.
         *
         * @return {Number} the size in bytes, or 0L if the file does not exist.
         */
        size: function () {
            return result.file.length();
        },

        /**
         * Returns the pathname string of this file's parent.
         *
         * @return {String} the parent, or null if no parent present.
         */
        parent: function () {
            return result.file.getParent();
        },

        /**
         * Gets the path part of this file.
         *
         * @return {String} the file path part.
         */
        path: function () {
            return result.file.getPath();
        },

        /**
         * Gets the name part of this file.
         *
         * @return {String} the name path part.
         */
        name: function () {
            return result.file.getName();
        },

        /**
         * Returns the time when the file was last modified.
         *
         * @return {Number} the last modified time in milliseconds since 00:00:00 GMT, January 1, 1970.
         */
        lastModified: function () {
            return result.file.lastModified();
        },

        /**
         * Lists the files and directories.
         *
         * @param {Function} receiver the function that receives each file or directory.
         */
        list: function (receiver) {
            var file = result.file;
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
                            receiver(file, next, true);
                        }
                    }
                    else {
                        receiver(file, next, false);
                    }
                }
            }
        },

        /**
         * Creates the directory structure, including any necessary but nonexistent parent directories.
         *
         * @return {Boolean} true if the directory was created, otherwise false.
         */
        mkdirs: function () {
            return (result.file.exists() || result.file.mkdirs());
        },

        /**
         * Reads the entire binary contents of the file.
         *
         * @return {Byte[]} the contents as a byte array, or null if the file doesn't exist.
         */
        readBinary: function () {
            if (result.file.isFile() && result.file.exists()) {
                var stream = new java.io.FileInputStream(result.file);
                var length = result.file.length();
                return crash.streams.readBinary(stream, length);
            }
            return null;
        },

        /**
         * Reads the entire text contents of the file.
         *
         * @param {String} charset the character set to use (defaults to "UTF-8").
         * @return {String} the contents of the text file, or null if the file doesn't exist.
         */
        readText: function (charset) {
            if (result.file.isFile() && result.file.exists()) {
                var stream  = new java.io.FileInputStream(result.file);
                return crash.streams.readText(stream, charset);
            }
            return null;
        },

        /**
         * Writes the entire text contents to file.
         *
         * @param {String} text the text contents.
         * @param {String} charset the (optional) character set to use (defaults to "UTF-8").
         */
        writeText: function (data, charset) {
            var stream = new java.io.FileOutputStream(result.file);
            var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(stream, charset || "UTF-8"));
            writer.write(data);
            writer.close();
            writer = null;
        },

        /**
         * Renames the file.
         *
         * @param {String} name the name of the new file.
         * @return {Boolean} true if the renaming succeeded, otherwise false.
         */
        renameTo: function (name) {
            var to = new java.io.File(name).getAbsolutePath();
            var renamed = result.file.renameTo(to);
            if (renamed) {
                result.file = new java.io.File(name).getAbsoluteFile();
            }
            return renamed;
        },

        /**
         * Makes a copy of the file.
         *
         * @param {String} dest the file to be copied to.
         * @return {Boolean} true if the copy succeeded, otherwise false.
         */
        copy: function (dest) {
            // See: http://www.mozilla.org/rhino/ScriptingJava.html
            var from = new java.io.BufferedInputStream(new java.io.FileInputStream(result.file));
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
        },

        /**
         * Moves a file to a new destination.
         *
         * @param {String} dest the destination file name.
         * @return {Boolean} true in case file could be moved, otherwise false.
         */
        move: function (dest) {
            if (!result.file.copy(dest)) {
                return false;
            }
            if (!result.file["delete"]()) {
                return false;
            }
            result.file = new java.io.File(dest).getAbsoluteFile();
            return true;
        },

        /**
         * Removes (deletes) the file or directory.
         *
         * @return {Boolean} true if the file was removed, otherwise false.
         */
        remove: function() {
           return result.file["delete"]();
        }
    };
    return result;
};