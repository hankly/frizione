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
 * Default (main) action for POST.
 */
function main_action_post() {

    app.debug("Fixture Request " + req.path);

    res.charset = "UTF8";
    var path = req.path.split('/');
    if (path.length > 3 && path[2] === "writefixture") {
        var file = '/' + path.slice(3, path.length).join('/');
        var reader = req.getServletRequest().getReader();
        var buffer = new java.lang.StringBuffer(1024);
        while (true) {
            var line = reader.readLine();
            if (line == null) {
                break;
            }
            if (buffer.length() > 0) {
                buffer.append('\n');
            }
            buffer.append(line);
        }
        reader.close();
        var data = String(buffer);

        path = this.group.path + file;
        app.debug("Fixture write: " + path);
        fileutils.makeDirs(path);
        fileutils.writeJson(path, data);
        res.status = 200;
        res.write("OK");
    }
    else {
        res.status = 500;
        res.write("Nothing to write");
    }
}

/**
 * Default (main) action for GET.
 */
function main_action_get() {

    app.debug("Fixture Request " + req.path);

    res.charset = "UTF8";
    var path = req.path.split('/');
    if (path.length > 3 && path[2] === "readfixture") {
        var file = '/' + path.slice(3, path.length).join('/');

        path = this.group.path + file;
        app.debug("Fixture read: " + path);

        if (fileutils.exists(path)) {
            var result = services.join(path, 'UTF-8', req.queryParams);
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
}

/**
 * Method used by Helma request path resolution.
 *
 * @param name the path element name.
 * @return the object that handles the element.
 */
function getChildElement(name) {
    app.debug("Fixture.getChildElement " + name);
    return this;
}