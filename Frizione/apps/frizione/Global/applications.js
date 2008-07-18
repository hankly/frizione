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
 * Gets the Helma applications canonical directory
 *
 * @return the canonical directory.
 */
function applicationsDir() {
    return new java.io.File(app.getServerDir() + '/apps').getCanonicalFile();
}

/**
 * Gets the current applications list.
 *
 * @param refresh refresh list flag (default is false).
 * @return the project list.
 */
function allApplications(refresh) {
    if (!refresh) {
        if (app.data.applications) {
            return app.data.applications;
        }
    }
    return app.data.applications = createFileList(applicationsDir(), function (info) {
        return new Application(info);
    });
}

/**
 * Gets the application by directory name.
 *
 * @param dir the directory name.
 */
function applicationByDir(dir) {
    allApplications();
    return app.data.applications.groups[dir];
}