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
/*global clutch */

if (!this.clutch) {
    clutch = {};
}

// Nasty piece of cut and paste - well almost. Just in case I add a timestamp to the unit test results.
clutch.date = {
    toClutchJSON: function () {
        function tens(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function hundreds(n) {
            // Format integers to have at least three digits.
            return n < 100 ? '0' + tens(n) : n;
        }

        Date.prototype.toJSON = function () {
            return "\\/Date(" +
                 this.getUTCFullYear()  + '-' +
                 tens(this.getUTCMonth() + 1) + '-' +
                 tens(this.getUTCDate())  + 'T' +
                 tens(this.getUTCHours()) + ':' +
                 tens(this.getUTCMinutes()) + ':' +
                 tens(this.getUTCSeconds()) + '.' +
                 hundreds(this.getUTCMilliseconds()) + 'Z' +
                 ")\\/";
        };
    }
};

/**
 * Store the unit test results (JSON format) to disk, with the help of the server.
 *
 * @param testFunction the test function to actually produce the report.
 * @param fixtureUrl the absolute URL of the fixture service.
 * @param viewUrl the absolute URL of the report viewer HTML page.
 */
clutch.storeTests = function (testFunction, fixtureUrl, viewUrl) {
    var date = new Date().toUTCString();
    var tests = testFunction();
    var intervalId = null;
    var element = document.getElementById('test-results');

    function handleRequest(status, statusText, responseText) {
        if (status >= 200 && status <= 299) {
            element.innerHTML = "Unit tests <a href = '" + viewUrl + "'>completed</a> and stored.";
        }
        else {
            element.innerHTML = "Couldn't store the unit test data. Status: " + status + " " + statusText;
        }
    }

    function checkTests() {
        var status = tests.check();
        if (status.complete) {
            window.clearInterval(intervalId);
            element.innerHTML = "Unit tests completed...";
            clutch.date.toClutchJSON();
            var summary = tests.summarise();
            summary.summary.date = date;
            clutch.test.executeRequest("POST", fixtureUrl,
                    null, JSON.stringify(summary, null, "\t"), 2000, handleRequest);
            return;
        }
        element.innerHTML = "" + status.index + " unit tests of " + status.total + " completed...";
    }

    intervalId = window.setInterval(checkTests, 500);
    element.innerHTML = "Running...";
    tests.run();
};