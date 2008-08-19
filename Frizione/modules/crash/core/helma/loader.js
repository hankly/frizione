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

/*
Inspired by Michael Mathew's IO.include
http://code.google.com/p/jsdoc-toolkit/
*/

/*globals crash, java, app */

if (!this.crash) {

    /**
     * @namespace Crash is a Rhino specific generic JavaScript library.
     */
    crash = {};
}

crash.dir = app.getServerDir() + '/modules';

/**
 * @field
 * The root crash URL.
 */
crash.root = new java.io.File(crash.dir).toURL();

/**
 * Load (execute) a JavaScript file or the entire contents of a directory.
 *
 * @param {String} rel the relative URL to the file or directory from the Helma modules directory.
 * @param {Function} filter optional name filter for directory loading.
 */
crash.load = function (rel, filter) {
    if (rel.charAt(0) === '/') {
        rel = rel.substring(1);
    }
    var file = new java.io.File(crash.dir, '/' + rel);
    if (!file.exists()) {
        throw new Error("Can't execute crash.load(" + rel + ") because the file doesn't exist");
    }
    if (file.isFile()) {
        app.addRepository('modules/' + rel);
    }
    else {
        var fileList = file.list();
        var length = 0;
        var i = 0;
        var next = null;
        if (fileList) {
            length = fileList.length;
            if (rel.charAt(rel.length - 1) !== '/') {
                rel += '/';
            }
            for (i = 0; i < length; i += 1) {
                next = fileList[i];
                if (new java.io.File(file, next).isFile()) {
                    if (filter ? filter(next) : true) {
                        app.addRepository('modules/' + rel + next);
                    }
                }
            }
        }
    }
};

crash.load("crash/core/streams.js");

/**
 * Finds a resource, and provides functions to load the resource as binary or text.
 *
 * @param {String} rel the relative URL to the resource from the Helma modules directory.
 * @return {crash.resourceUtils} the resource loader.
 */
crash.resource = function (rel) {

    function check(original, rel) {
        if (rel.charAt(0) === '/') {
            rel = rel.substring(1);
        }
        rel = new java.net.URI(original).resolve(rel).toString();
        var file = new java.io.File(crash.dir, rel);
        if (!file.exists() || !file.isFile()) {
            throw new Error("Can't create crash.resource(" + rel + ") because the file doesn't exist");
        }
        return rel;
    }

    function makeResource(rel) {

        /**
         * The resource loader object.
         * This object is constructed via the {@link crash.resource} function.
         *
         * @class
         * @name crash.resourceUtils
         */
        var res = /** crash.resourceUtils.prototype */ {

            /**
             * The original resource relative url.
             *
             * @type String
             */
            original: rel,

            /**
             * Finds a resource, and provides functions to load the resource as binary or text.
              *
             * @param rel (String) rel the relative URL wrt this resource.
             * @return {Object} the resource loader.
             */
            resource: function (rel) {
                return makeResource(check(res.original, rel));
            },

            /**
             * Reads the entire binary contents of the resource.
             *
             * @param (int) length the (optional) binary resource length.
             * @return {byte[]} the contents as a byte array, or null if the resource doesn't exist.
             */
            readBinary: function (length) {
                var stream = new java.io.FileInputStream(new java.io.File(crash.dir, '/' + rel));
                return crash.streams.readBinary(stream, length);
            },

            /**
             * Reads the entire text contents of the resource.
             *
             * @param {String} charset the (optional) character set to use (defaults to "UTF-8").
             * @return {String} the contents as text, or null if the resource doesn't exist.
             */
            readText: function (charset) {
                var stream = new java.io.FileInputStream(new java.io.File(crash.dir, '/' + rel));
                return crash.streams.readText(stream, charset);
            }
        };
        return res;
    }

    return makeResource(check("", rel));
};