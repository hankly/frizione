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

/*jslint evil: true */
/*global clutch, google */

// Simple WorkerPool termination functions.
// I don't see any advantage in producing a generic library for these simple functions.

if (!this.clutch) {
    clutch = {};
}

/**
 * Logs received messages, errors and timer intervals.
 */
clutch.workerPoolLogger = function () {
    var self = google.gears.workerPool;
    var logger = clutch.db.logger('clutch_gears');

    function actOnTimer() {
        var now = new Date();
        logger.log("timer", now.toUTCString() + " " + now.getUTCMilliseconds());
    }

    function actOnMessage(depr1, depr2, message) {
        var now = new Date();
        logger.log("message", now.toUTCString() + " " + now.getUTCMilliseconds() + " " + message.body);
        self.sendMessage("Message logged", message.sender);
    }

    function actOnError(error) {
        var now = new Date();
        logger.log("error", now.toUTCString() + " " + now.getUTCMilliseconds() + " Error(" + error.lineNumber + '): ' + error.message);
        return false;
    }

    self.onmessage = actOnMessage;
    self.onerror = actOnError;
    clutch.timer.setInterval(actOnTimer, 500);
};

clutch.workerPoolLogger();