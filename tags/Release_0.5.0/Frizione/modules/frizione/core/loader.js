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

/*globals app, crash, frizione, java */

/**
 * The root frizione directory (Helma Server directory).
 *
 * @type {String}
 */
frizione.dir = app.getServerDir();

/**
 * The root frizione URL.
 *
 * @type {java.net.URL}
 */
frizione.root = new java.io.File(frizione.dir).toURL();

/**
 * Finds a resource, and provides functions to load the resource as binary or text.
 *
 * @param {String} rel the relative URL to the resource from the Helma Server directory.
 * @return {frizione.resourceLoader} the resource loader.
 */
frizione.resource = function (rel) {

    function check(original, rel) {
        if (rel.charAt(0) === '/') {
            rel = rel.substring(1);
        }
        rel = new java.net.URI(original).resolve(rel).toString();
        var file = new java.io.File(frizione.dir, rel);
        if (!file.exists() || !file.isFile()) {
            throw new Error("Can't create frizione.resource(" + rel + ") because the file doesn't exist");
        }
        return rel;
    }

    /**
     * @class The resource loader object.
     * This object is constructed via the {@link frizione.resource} function.
     *
     * @name frizione.resourceLoader
     */
    function makeResource(rel) {

        var res = /** @scope frizione.resourceLoader.prototype */ {

            /**
             * The original resource relative url.
             *
             * @type {String}
             */
            original: rel,

            /**
             * Finds a resource, and provides functions to load the resource as binary or text.
              *
             * @param {String} rel the relative URL wrt this resource.
             * @return {frizione.resourceLoader} the resource loader.
             */
            resource: function (rel) {
                return makeResource(check(res.original, rel));
            },

            /**
             * Reads the entire binary contents of the resource.
             *
             * @param {Number} length the (optional) binary resource length.
             * @return {java.lang.Byte[]} the contents as a byte array, or <code>null</code> if the resource doesn't exist.
             */
            readBinary: function (length) {
                var stream = new java.io.FileInputStream(new java.io.File(frizione.dir, '/' + rel));
                return crash.streams.readBinary(stream, length);
            },

            /**
             * Reads the entire text contents of the resource.
             *
             * @param {String} charset the (optional) character set to use, defaults to "UTF-8".
             * @return {String} the contents as text, or <code>null</code> if the resource doesn't exist.
             */
            readText: function (charset) {
                var stream = new java.io.FileInputStream(new java.io.File(frizione.dir, '/' + rel));
                return crash.streams.readText(stream, charset);
            }
        };
        return res;
    }

    return makeResource(check("", rel));
};