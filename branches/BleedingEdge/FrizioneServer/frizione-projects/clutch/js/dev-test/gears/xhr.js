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
/*global clutch, google, createXhrTests, runXhrTests */

function createXhrTests() {

    return clutch.test.unit('XHR Tests', {

        clutchTests: [
            { func: 'validUrl', callbacks: [ 'validUrlHandler' ] },
            { func: 'invalidUrl', callbacks: [ 'invalidUrlHandler' ] },
            { func: 'abortedRequest', callbacks: [ 'abortedRequestHandler' ] }
        ],

        validUrl: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/clutch/readfixture/js/dev-test/gears/xhr-test-data.json',
                    null, null, 2000, this.validUrlHandler);
            this.checkAbort(abort);
        },

        validUrlHandler: function (status, statusText, responseText) {
            this.assert(status >= 200 && status <= 299, "Status not between 200 and 299: " + status + ", " + statusText);
        },

        invalidUrl: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/clutch/readfixture/invalid-url.json',
                    null, null, 2000, this.invalidUrlHandler);
            this.checkAbort(abort);
        },

        invalidUrlHandler: function (status, statusText, responseText) {
            this.assert(status >= 400 && status <= 499, "Status not between 400 and 499: " + status + ", " + statusText);
        },

        abortedRequest: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/clutch/readfixture/invalid-url.json',
                    null, null, 2000, this.abortedRequestHandler);
            this.checkAbort(abort);
            abort();
        },

        abortedRequestHandler: function (status, statusText, responseText) {
            this.assert(status === -1, "Status not -1");
            this.assert(statusText === 'Aborted', "Status text not 'Aborted'");
            this.assert(responseText === 'Aborted', "Response text not 'Aborted'");
        },

        checkAbort: function (abort) {
            this.assert(abort !== null, "Returned value is null");
            this.assert(typeof abort === 'function', "Returned value is not a function");
        }
        
    }, 6500);
}

function runClutchTests() {
    return createXhrTests();
}