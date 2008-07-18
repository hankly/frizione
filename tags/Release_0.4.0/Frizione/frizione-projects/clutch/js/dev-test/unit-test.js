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
/*global clutch, createUnitTests, runClutchTests */

function createUnitTests() {

    return clutch.test.unit('Assertion Tests', {

        clutchTests: [
            { func: 'logTest', callbacks: null },
            { func: 'passTest', callbacks: null },
            { func: 'failTest', callbacks: null },
            { func: 'errorTest', callbacks: null },
            { func: 'assertTest', callbacks: null }
        ],

        logTest: function () {
            this.log("Test log message");
            this.assert(true === true);
        },

        passTest: function () {
            this.pass();
            this.assert(true === true);
        },

        failTest: function () {
            this.fail("Test fail() call");
            this.assert(true === false, "assert(false) guaranteed to fail");
        },

        errorTest: function () {
            throw new Error("Test error() call");
        },

        assertTest: function () {
            this.assert(true === true, "assert(true) shouldn't fail");
        }
    }, 1000);
}

function runClutchTests() {
    return createUnitTests();
}