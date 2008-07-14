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
 * Project object constructor.
 *
 * @class Project
 * @constructor
 * @param info the (modified) project json file contents.
 */
function constructor(info) {
    app.debug('Project ' + info.name);
    this.name = info.name;
    this.home = info.home;
    this.dir = info.dir;
    this.path = info.path;

    this.services = { };
    this.services.jslint = new JsLint(this);
    this.services.jsonview = new View(this, 'json');
    this.services.htmlview = new View(this, 'html');
    this.services.cssjoin = new Join(this, 'css');
    this.services.jsjoin = new Join(this, 'js');
    this.services.cssminify = new Minify(this, 'css');
    this.services.jsminify = new Minify(this, 'js');
    this.services.jstest = new Test(this, 'js');
    this.services.jsontest = new Test(this, 'json');
    this.services.readfixture = new Fixture(this, 'read');
    this.services.writefixture = new Fixture(this, 'write');

    this.refreshFiles();
}

function refreshFiles() {
    app.debug('Project ' + this.name + ' refresh files');
    this.files = fileutils.listAll(this.path, [ '.css', '.js', '.json', '.html' ], null);
}