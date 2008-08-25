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

if (!this.clutch) {
    clutch = {};
}

if (!this.clutch.timer) {

    /**
     * @namespace Clutch timer functions.
     * The timer functions are taken from either the standard browser functions or the Gears timer object,
     * depending on availability. These functions are guaranteed for either the browser or WorkerPool environments.
     */
    clutch.timer = {};
}

// Creates timer functions using either the browser timer or a Gears timer when no browser timer is available.

(function () {
    var gearsTimer = null;

    // don't try to simplify this stuff, clutch.timer.setTimeout = window.setTimeout causes all sorts of problems
    // with Opera and Firefox (which actually crashes)
    if (!!this.window && !!this.window.setTimeout) {

        /**
         * Calls a function after the specified number of milliseconds.
         *
         * @param {Function} func the function to call.
         * @param {Number} millis the number of milliseconds to wait.
         * @return {Number} the timer identifier.
         */
        clutch.timer.setTimeout = function (code, millis) {
            return window.setTimeout(code, millis);
        };

        /**
         * Repeatedly calls a function with the specified number of milliseconds
         * delay between each call.
         *
         * @param {Function} func the function to call.
         * @param {Number} millis the number of milliseconds to wait.
         * @return {Number} the timer identifier.
         */
        clutch.timer.setInterval = function (code, millis) {
            return window.setInterval(code, millis);
        };

        /**
         * Removes a previously set timeout.
         *
         * @param {Number} id the timeout identifier.
         */
        clutch.timer.clearTimeout = function (timerId) {
            window.clearTimeout(timerId);
        };

        /**
         * Removes a previously set interval.
         *
         * @param {Number} id the interval identifier.
         */
        clutch.timer.clearInterval = function (timerId) {
            window.clearInterval(timerId);
        };
    }
    else {
        gearsTimer = clutch.createGearsTimer();
        clutch.timer.setTimeout = function (code, millis) {
            return gearsTimer.setTimeout(code, millis);
        };
        clutch.timer.setInterval = function (code, millis) {
            return gearsTimer.setInterval(code, millis);
        };
        clutch.timer.clearTimeout = function (timerId) {
            gearsTimer.clearTimeout(timerId);
        };
        clutch.timer.clearInterval = function (timerId) {
            gearsTimer.clearInterval(timerId);
        };
    }
})();