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

/*globals java, crash */

if (!this.crash.streams) {

    /**
     * @namespace Specialised functions for reading from and writing to streams.
     */
    crash.streams = {};
}

/**
 * Reads the entire binary contents from an input stream.
 *
 * @param {InputStream} stream the input stream of the binary resource.
 * @param {Number} length the (optional) binary resource length.
 * @return {byte[]} the contents as a byte array, or null if the resource doesn't exist.
 */
crash.streams.readBinary = function (stream, length) {
    try {
        length = length || 4096;
        var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length);
        var outputStream = new java.io.ByteArrayOutputStream();
        var read = 0;
        while ((read = stream.read(buffer, 0, length)) >= 0) {
            outputStream.write(buffer, 0, read);
        }
        stream.close();
        return outputStream.toByteArray();
    }
    catch (e) {
        return null;
    }
};

/**
 * Reads the entire text contents from an input stream.
 *
 * @param {InputStream} stream the input stream of the text resource.
 * @param {String} charset the (optional) character set to use (defaults to "UTF-8").
 * @return {String} the contents as text, or null if the resource doesn't exist.
 */
crash.streams.readText = function (stream, charset) {
    try {
        charset = charset || "UTF-8";
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(stream, charset));
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
    catch (e) {
        return null;
    }
};

/**
 * Writes the entire binary contents to an output stream.
 *
 * @param {OutputStream} stream the output stream for the binary contents.
 * @param {byte[]} data the binary contents.
 */
crash.streams.writeBinary = function (stream, data) {
    stream.write(data);
    stream.close();
};

/**
 * Writes the entire text contents to an output stream.
 *
 * @param {OutputStream} stream the output stream for the text contents.
 * @param {String} text the text contents.
 * @param {String} charset the (optional) character set to use (defaults to "UTF-8").
 */
crash.streams.writeText = function (stream, text, charset) {
    var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(stream, charset || "UTF-8"));
    writer.write(text);
    writer.close();
};