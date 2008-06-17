/*

*/

/*jslint evil: true */
/*global clutch, createUnitTests, runClutchTests */

function createUnitTests() {
    return clutch.test.unit('Assertion Tests', {

        testLog: function () {
            this.log("Test log message");
            this.assert(true === true);
        },

        testPass: function () {
            this.pass();
            this.assert(true === true);
        },

        testFail: function () {
            this.fail("Test fail() call");
            this.assert(true === false, "assert(false) guaranteed to fail");
        },

        testError: function () {
            this.error(new Error("Test error() call"));
        },

        testAssert: function () {
            this.assert(true === true, "assert(true) shouldn't fail");
        }
    }, 1000);
}

function runClutchTests() {
    return createUnitTests();
}