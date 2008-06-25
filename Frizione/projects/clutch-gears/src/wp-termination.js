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
/*global clutch, google, $, $A */

// Simple WorkerPool termination check functions.
// I don't see any advantage in producing a generic library for these simple functions.

/**
 * Start the WorkerPool.
 */
function startWorkerPool() {
    var messageId = 1;
    var worker = null;
    var workerId = null;
    var linkSet = false;

    function sendMessage() {
        worker.sendMessage("Main message #" + messageId + " to " + workerId, workerId);
        messageId += 1;
    }

    function actOnMessage(depr1, depr2, message) {
        if (message.sender === workerId) {
            if (!linkSet) {
                $('external-link').replace("<p id = 'external-link'><code>WorkerPool</code> running. " +
                                           "Please click on this <a href='http://www.syger.it/'>link</a> " +
                                           "then come back after a few seconds.</p>");
                linkSet = true;
            }
            clutch.timer.setTimeout(sendMessage, 250);
        }
    }

    worker = clutch.createGearsWorkerPool();
    worker.onmessage = actOnMessage;
    workerId = worker.createWorkerFromUrl('/projects/clutch-gears/tests/wp-logger.js');
    sendMessage();
}

/**
 * Give visual feedback for WorkerPool termination.
 */
function checkWorkerPoolTermination() {

    function showDatabase() {
        var logger = clutch.db.logger('clutch_gears');
        var params = { orderBy: 'id DESC', limit: 20 };
        var rows = $A(logger.list(params));
        var result = [];
        rows.each(function (row) {
            result.push("<tr><td>" + row.id + "</td><td>" + row.name + "</td><td>" + row.value + "</td></tr>");
        });
        result = "<table id='db-results'>" +
                        "<thead><tr><th>Id</th><th>Name</th><th>Value</th></tr></thead>" +
                        "<tbody>" + result.join('') + "</tbody>" +
                     "</table>";
        $('db-results').replace("<div align='center'>" + result + "</div>");
        $('start-wp').replace("<p id='start-up'>" +
                              "Please <a href='javascript:void(0);' onclick='startWorkerPool(); return true;'>start</a> " +
                              "the <code>WorkerPool</code>.</p>");
        logger.removeAll();
    }

    document.observe('dom:loaded', function() {
        showDatabase();
    });
}