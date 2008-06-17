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
/*global clutch, storeClutchTests, ActiveXObject */
/*members clutch, date, executeRequest, getElementById, getUTCDate,
    getUTCFullYear, getUTCHours, getUTCMilliseconds, getUTCMinutes,
    getUTCMonth, getUTCSeconds, innerHTML, prototype, run, stringify,
    summary, toClutchJSON, toJSON */

if (!this.clutch) {
    clutch = {};
}

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

function storeClutchTests(testFunction, jsonUrl, viewUrl) {

    jsonUrl = '/run-fixture' + jsonUrl;
    var tests = testFunction();
    var timerId = null;

    function handleRequest(status, statusText, responseText) {
        var element = document.getElementById('test-results');
        if (status >= 200 && status <= 299) {
            element.innerHTML = "Unit tests <a href = '" + viewUrl + "'>completed</a> and stored.";
        }
        else {
            element.innerHTML = "Couldn't store the unit test data. Status: " + status + " " + statusText;
        }
    }

    function checkTests() {
        var element = document.getElementById('test-results');
        var status = tests.check();
        if (status.complete) {
            window.clearTimeout(timerId);
            element.innerHTML = "Unit tests completed...";
            clutch.date.toClutchJSON();
            clutch.executeRequest("POST", jsonUrl, null, JSON.stringify(tests.summarise(), null, "\t"), handleRequest);
            return;
        }
        element.innerHTML = "" + status.index + " unit tests of " + status.total + " completed...";
    }

    timerId = window.setInterval(checkTests, 500);
    tests.run();
}