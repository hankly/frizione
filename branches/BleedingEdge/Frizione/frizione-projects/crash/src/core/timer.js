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

/*globals crash, java */

if (!this.crash) {
    crash = {};
}

if (!this.crash.timer) {
    crash.timer = {};
}

(function () {

    var nextId = 0;
    var timers = new java.util.Hashtable();

    /*
     * Creates a timer object which calls a function after the specified number of milliseconds.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @param (Boolean) repeat true if the function must be called repeatedly
     */
    var makeTimer = function (func, millis, repeat) {
        var timer = {
            func: func,
            wait: millis,
            repeat: repeat,
            when: new Date().getTime() + millis
        };
        var id = nextId;
        nextId += 1;
        timers.put(id.toString(), timer);
        return id;
    };

    var thread = new java.lang.Thread(new java.lang.Runnable({

        run: function () {
            var now = null;
            var keys = null;
            var key = null;
            var timer = null;
            var run = false;
            var length = 0;
            var i = 0;
            while (true) {
                now = new Date().getTime();
                run = false;
                keys = timers.keySet().toArray();
                length = keys.length;
                for (i = 0; i < length; i += 1) {
                    key = keys[i];
                    timer = timers.get(key);
                    if (timer !== null && timer.when <= now) {
                        run = true;
                        timer.func();
                        if (timer.repeat) {
                            timer.when += timer.wait;
                        }
                        else {
                            timers.remove(key);
                        }
                    }
                }
                if (!run) {
                    java.lang.Thread.currentThread().sleep(1);
                }
            }
        }
    }));
    thread.start();

    /**
     * Calls a function after the specified number of milliseconds.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @return {Number) the timer identifier.
     */
    crash.timer.setTimeout = function (func, millis) {
        return makeTimer(func, millis, false);
    };

    /**
     * Repeatedly calls a function with the specified number of milliseconds
     * delay between each call.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @return {Number) the timer identifier.
     */
    crash.timer.setInterval = function (func, millis) {
        return makeTimer(func, millis, true);
    };

    /**
     * Removes a previously set timeout.
     *
     * @param {Number} id the timeout identifier.
     */
    crash.timer.clearTimeout = function (id) {
        crash.timer.clearInterval(id);
    };

    /**
     * Removes a previously set interval.
     *
     * @param {Number} id the iterval identifier.
     */
    crash.timer.clearInterval = function (id) {
        var ident = id.toString();
        var timer = timers.get(ident);
        if (timer !== null ) {
            timers.remove(ident);
        }
    };

    /**
     * Causes the program to pause for the specified number of milliseconds.
     *
     * @param {Number} millis the number of milliseconds to pause.
     */
    crash.timer.pause = function (millis) {
        java.lang.Thread.currentThread().sleep(millis);
    };
})();