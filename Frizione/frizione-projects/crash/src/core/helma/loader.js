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
    crash = {};
}

(function () {

    // for documentation, see core/loader.js

    crash.root = app.getServerDir();

    crash.include = function (rel) {
        if (rel.charAt(0) === '/') {
            rel = rel.substring(1);
        }
        var file = new java.io.File(crash.root + '/' + rel).getAbsoluteFile();
        if (file.isFile()) {
            app.addRepository(rel);
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
                        app.addRepository(rel + next);
                    }
                }
            }
        }
    };
})();