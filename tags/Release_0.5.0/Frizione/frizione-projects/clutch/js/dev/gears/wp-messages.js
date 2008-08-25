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

/*
Inspired by Aaron Boodman's Worker2 micro project
See http://groups.google.com/group/gears-users/browse_thread/thread/62a021c62828b8e4/67f494497639b641
*/

/*jslint evil: false */
/*global clutch, google */

if (!this.clutch) {
    clutch = {};
}
if (!this.clutch.wp) {

    /**
     * @namespace Gears worker pool functions.
     */
    clutch.wp = {};
}

/**
 * Message handlers (functions) for specific commands.
 * A command is simply a string, which is associated with a function (the handler).
 * For example the Clutch unit testing code uses two commands,
 * <code>clutch.test.run</code> and <code>clutch.test.status</code> to run and check the
 * status of unit tests within a Worker Pool from the main page.
 */
clutch.wp.handlers = {
    'default': function (message) {
        throw new Error("No message handler for '" + message.body.command + "'");
    }
};

/**
 * Finds the specific WorkerPool message handler for a given message, and
 * then calls the handler.
 * If no handler is found, then the default handler is used.
 * 
 * @param depr1 deprecated message contents (not used).
 * @param depr2 deprecated sender id (not used).
 * @param message the message object.
 */
clutch.wp.onMessage = function (depr1, depr2, message) {
    var body = message.body;
    var handler = clutch.wp.handlers[body.command] || clutch.wp.handlers['default'];
    handler(message);
};