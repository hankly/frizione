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

/*global crash */

/**
 * @namespace Logging functions.
 * The logger object stores messages in memory. The programmer must retrieve these messages and send them to
 * standard, error, or a file output.
 */
crash.logger = {

    /**
     * The logged information.
     * 
     * @field
     */
    log: {
        info: 0,
        warnings: 0,
        errors: 0,
        abend: null,
        messages: []
    },

    /**
     * Clears all logged messages.
     */
    clear: function () {
        var log = crash.logger.log;
        log.info = 0;
        log.warnings = 0;
        log.errors = 0;
        log.abend = null;
        log.messages = [];
    },

    /**
     * Logs an informational message.
     *
     * @param {String} message the message.
     */
    info: function (message) {
        var log = crash.logger.log;
        log.logs += 1;
        log.messages.push({ type: 'info', message: message });
    },

    /**
     * Logs a warning message.
     *
     * @param {String} message the message.
     * @param {Error} error the (optional) error object.
     */
    warning: function (message, error) {
        var log = crash.logger.log;
        log.warnings += 1;
        var errorMessage = error ? " " + crash.logger.errorMessage(error) : "";
        log.messages.push({ type: "warning", message: message + errorMessage });
    },

    /**
     * Logs an error message.
     *
     * @param {String} message the message.
     * @param {Error} error the (optional) error object.
     */
    error: function (message, error) {
        var log = crash.logger.log;
        log.errors += 1;
        var errorMessage = error ? " " + crash.logger.errorMessage(error) : "";
        log.messages.push({ type: "error", message: message + errorMessage });
    },

    /**
     * Logs a fatal error message.
     *
     * @param {String} message the message.
     * @param {Error} error the (optional) error object.
     */
    fatal: function (message, error) {
        var log = crash.logger.log;
        log.errors += 1;
        var errorMessage = error ? " " + crash.logger.errorMessage(error) : "";
        message += errorMessage;
        log.messages.push({ type: "fatal", message: message });
        if (log.abend === null) {
            log.abend = message;
        }
    },

    errorMessage: function (error) {
        var message = error.name + ': ' + error.message;
        if (error.filename && error.lineNumber && error.stack) {
            message = error.filename + '(' + error.lineNumber + ') ' + message + '\n' + error.stack;
        }
        else if (error.filename && error.lineNumber) {
            message = error.filename + '(' + error.lineNumber + ') ' + message;
        }
        return message;
    }
};