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

/*global app, req, res, java, crash, frizione */

/**
 * StaticFiles object constructor.
 *
 * @class StaticFiles
 * @constructor
 * @param {String} dir the application static file directory.
 * @param (String) path the file system path.
 */
function constructor(dir, path) {
    app.debug('StaticFiles ' + dir);
    this.dir = dir;
    this.path = path;
}

/**
 * Default (main) action.
 */
function main_action() {
    app.debug("StaticFiles Request " + req.path);

    switch (this.dir) {
        case 'js':
            res.charset = "UTF-8";
            res.contentType = "application/javascript";
            this.renderTextFile(this.path + '/' + req.path);
            break;
        case 'css':
            res.charset = "UTF-8";
            res.contentType = "text/css";
            this.renderTextFile(this.path + '/' + req.path);
            break;
        case 'imgs':
            if (req.path.endsWith('.png')) {
                res.contentType = "image/png";
            }
            else {
                res.contentType = "image/gif";
            }
            this.renderBinaryFile(this.path + '/' + req.path);
            break;
        case 'docs':
            res.contentType = "application/pdf";
            this.renderBinaryFile(this.path + '/' + req.path);
            break;
    }
}

/**
 * Renders the specified text file.
 *
 * @param {String} path the absolute path to the file.
 */
function renderTextFile(path) {
    var encoding = req.getHeader('accept-encoding');
    if (encoding && encoding.indexOf('gzip') >= 0) {
        if (new java.io.File(path + ".gz").exists()) {
            res.addHeader('Content-Encoding', 'gzip');
            app.debug("StaticFiles Modified Request " + req.path + ".gz");
            this.renderBinaryFile(path + '.gz');
            return;
        }
    }
    res.write(crash.file(path).readText());
}

/**
 * Renders the specified binary file.
 *
 * @param {String} path the absolute path to the file.
 */
function renderBinaryFile(path) {
    res.writeBinary(crash.file(path).readBinary());
}

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the element.
 */
function getChildElement(name) {
    app.debug("StaticFiles.getChildElement " + name);
    return this;
}