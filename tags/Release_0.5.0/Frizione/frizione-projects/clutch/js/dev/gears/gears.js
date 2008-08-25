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

/*jslint evil: false */
/*global clutch, google */

// Just wrapper code, so that if 'beta.xxx' becomes 'gamma.xxx', or the namespace changes (is that really likely?)
// I won't have to hunt around in a lot of JavaScript files...

if (!this.clutch) {
    clutch = {};
}

/**
 * Checks if Gears is installed.
 *
 * @returns {Boolean} <code>true</code> if Gears is installed, otherwise <code>false</code>.
 */
clutch.isGearsInstalled = function () {
    return (function () {
        if (!!this.window) {
            return window.google && google && google.gears;
        }
        else {
            return google && google.gears;
        }
    })();
};

/**
 * Gets the Gears factory object
 *
 * @return {GearsFactory} the Gears factory object.
 */
clutch.gearsFactory = function () {
    return google.gears.factory;
};

/**
 * Creates a Gears database object.
 *
 * @return {GearsDatabase} the Gears database object.
 */
clutch.createGearsDatabase = function () {
    return google.gears.factory.create('beta.database');
};

/**
 * Creates a Gears desktop object.
 *
 * @return {GearsDesktop} the Gears desktop object.
 */
clutch.createGearsDesktop = function () {
    return google.gears.factory.create('beta.desktop');
};

/**
 * Creates a Gears HTTP request object.
 *
 * @return {GearsHttpRequest} the Gears HTTP request object.
 */
clutch.createGearsHttpRequest = function () {
    return google.gears.factory.create('beta.httprequest');
};

/**
 * Creates a Gears local server object.
 *
 * @return {GearsLocalServer} the Gears local server object.
 */
clutch.createGearsLocalServer = function () {
    return google.gears.factory.create('beta.localserver');
};

/**
 * Creates a Gears timer object.
 *
 * @return {GearsTimer} the Gears timer object.
 */
clutch.createGearsTimer = function () {
    return google.gears.factory.create('beta.timer');
};

/**
 * Creates a Gears worker pool object.
 *
 * @return {GearsWorkerPool} the Gears worker pool object.
 */
clutch.createGearsWorkerPool = function () {
    return google.gears.factory.create('beta.workerpool');
};