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
 * Gets the clutch static canonical directory.
 *
 * @return the canonical directory.
 */
function staticDir() {
    return new java.io.File('./apps/frizione/StaticFiles').getCanonicalFile().toString();
}

/**
 * Gets the clutch static document canonical directory.
 *
 * @return the canonical directory.
 */
function staticDocsDir() {
    return new java.io.File('../').getCanonicalFile().toString();
}

/**
 * Renders the specified JavaScript file.
 *
 * @param path the absolute path to the file.
 */
function renderJavaScript(path) {
    res.contentType = "application/javascript";
    res.charset = "UTF8";
    this.renderTextFile(path);
}

/**
 * Renders the specified Cascading Style Sheet file.
 *
 * @param path the absolute path to the file.
 */
function renderCascadingStyleSheet(path) {
    res.contentType = "text/css";
    res.charset = "UTF8";
    this.renderTextFile(path);
}

/**
 * Renders the specified text file.
 *
 * @param path the absolute path to the file.
 */
function renderTextFile(path) {
    var encoding = req.getHeader('accept-encoding');
    if (encoding && encoding.indexOf('gzip') >= 0) {
        if (fileutils.exists(path + ".gz")) {
            res.addHeader('Content-Encoding', 'gzip');
            app.debug("StaticFiles Modified Request " + req.path + ".gz");
            this.renderBinaryFile(path + '.gz');
            return;
        }
    }
    res.write(fileutils.readText(path));
}

/**
 * Renders the specified Portable Network Graphics file.
 *
 * @param path the absolute path to the file.
 */
function renderImage(path) {
    if (path.endsWith('.png')) {
        res.contentType = "image/png";
    }
    else {
        res.contentType = "image/gif";
    }
    this.renderBinaryFile(path);
}

/**
 * Renders the specified Portable Document Format file.
 *
 * @param path the absolute path to the file.
 */
function renderDocument(path) {
    res.contentType = "application/pdf";
    this.renderBinaryFile(path);
}

/**
 * Renders the specified binary file.
 *
 * @param path the absolute path to the file.
 */
function renderBinaryFile(path) {
    res.writeBinary(fileutils.readBinary(path));
}