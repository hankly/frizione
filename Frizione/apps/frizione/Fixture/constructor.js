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

/*global app, req, res */
/*global java, frizione, Fixture */

/**
 * @class The Fixture object.
 * This object responds to <code>/writefixture</code> and <code>/readfixture</code> URLs.
 *
 * @name Fixture
 * @constructor
 *
 * @description Creates a new Fixture object.
 * 
 * @param {Application, Module, Project} group the application/module/project object.
 * @param {String} type the fixture type, either 'read' or 'write'.
 */
function constructor(group, type) {
    app.debug('Fixture ' + type + ": " + group.type + ": " + group.name);
    this.group = group;
    this.type = type;
}

/**
 * Default (main) action for POST.
 * Takes the filepath from the <code>/writefixture</code> part of the URL, and writes
 * the POST data to this filepath.
 */
Fixture.prototype.main_action_post = function () {
    app.debug("Fixture Request " + req.path);

    res.charset = "UTF8";
    var path = req.path.split('/');
    if (path.length > 3 && path[2] === "writefixture") {
        var fileName = '/' + path.slice(3, path.length).join('/');
        var reader = req.getServletRequest().getReader();
        var buffer = new java.lang.StringBuffer(1024);
        while (true) {
            var line = reader.readLine();
            if (line === null) {
                break;
            }
            if (buffer.length() > 0) {
                buffer.append('\n');
            }
            buffer.append(line);
        }
        reader.close();
        var data = String(buffer);

        path = this.group.path + fileName;
        app.debug("Fixture write: " + path);
        var file = frizione.file(path);
        file.mkdirs();
        file.writeText(data);
        res.status = 200;
        res.write("OK");
    }
    else {
        res.status = 500;
        res.write("Nothing to write");
    }
};

/**
 * Default (main) action for GET.
 * Reads the contents of the filepath from the <code>/readfixture</code> part of the URL,
 * using the query parameters, and returns the modified file contents.
 */
Fixture.prototype.main_action_get = function () {
    app.debug("Fixture Request " + req.path);

    res.charset = "UTF8";
    var path = req.path.split('/');
    if (path.length > 3 && path[2] === "readfixture") {
        var file = path.slice(3, path.length).join('/');

        path = this.group.prefix + '/' + this.group.dir + '/' + file;
        app.debug("Fixture read: " + path);

        if (new java.io.File(path).exists()) {
            var result = frizione.service.join(path, 'UTF-8', req.queryParams);
            res.status = 200;
            res.write(result);
        }
        else {
            app.debug("Fixture read: " + path + " the file doesn't exist");
            res.status = 404;
            res.write("The requested file doesn't exist");
        }
    }
    else {
        res.status = 500;
        res.write("Nothing to read");
    }
};

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the child element.
 */
Fixture.prototype.getChildElement = function (name) {
    app.debug("Fixture.getChildElement " + name);
    return this;
};