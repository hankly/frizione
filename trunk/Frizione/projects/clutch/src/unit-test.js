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

clutch.testutils = {
    createTotaliser: function () {
        return {
            tests: 0,
            failures: 0,
            errors: 0,
            time: 0,
            running: false,
            messages: []
        };
    },

    clearTotaliser: function (totaliser) {
        totaliser.tests = 0;
        totaliser.failures = 0;
        totaliser.errors = 0;
        totaliser.time = 0;
        totaliser.running = false;
        totaliser.messages = [];
    },

    copyTotaliser: function (from, to) {
        to.tests = from.tests;
        to.failures = from.failures;
        to.errors = from.errors;
        to.time = from.time;
        to.running = from.running;
        to.messages = from.messages;
    },

    cloneTotaliser: function (totaliser) {
        var clone = this.createTotaliser();
        this.copyTotaliser(totaliser, clone);
        return clone;
    },

    sumTotaliser: function (from, to) {
        to.tests += from.tests;
        to.failures += from.failures;
        to.errors += from.errors;
        to.time += from.time;
    }
};

clutch.assertions = function () {
    var passMessage = { type: 'pass', message: '' };
    var totaliser = clutch.testutils.createTotaliser();

    return {
        run: function (name) {
            var startAt = new Date().getTime();
            try {
                try {
                    this.setUp();
                    startAt = new Date().getTime();
                    this[name]();
                }
                finally {
                    totaliser.time += (new Date().getTime() - startAt);
                    this.tearDown();
                }
            }
            catch(e) {
                this.error(e);
            }
        },

        pass: function (message) {
            totaliser.tests += 1;
            totaliser.messages.push(message ? { type: 'pass', message: message } : passMessage);
        },

        fail: function (message) {
            totaliser.tests += 1;
            totaliser.failures += 1;
            totaliser.messages.push({ type: "fail", message: message });
        },

        error: function (error) {
            totaliser.tests += 1;
            totaliser.errors += 1;
            var message = error.name + ': ' + error.message;
            if (error.fileName) {
                message = error.fileName + '(' + error.lineNumber + ') ' + message + '\n' + error.stack;
            }
            totaliser.messages.push({ type: "error", message: message });
        },

        assert: function (condition, message) {
            try {
                if (condition) {
                    this.pass();
                }
                else {
                    message = message || "assert: " + condition;
                    this.fail(message);
                }
            }
            catch(e) {
                this.error(e);
            }
        },

        summary: function () {
            return totaliser;
        }
    };
};

clutch.unittest = function (name, testObject) {
    var utils = clutch.testutils;
    var results = [];
    var accumulated = utils.createTotaliser();

    return {
        run: function () {

            if (!testObject.setUp) {
                testObject.setUp = function () {};
            }
            if (!testObject.tearDown) {
                testObject.tearDown = function () {};
            }

            var assertions = clutch.assertions();
            var totaliser = assertions.summary();
            var prop = null;
            for (prop in assertions) {
                if (assertions.hasOwnProperty(prop)) {
                    testObject[prop] = assertions[prop];
                }
            }

            for (prop in testObject) {
                if (testObject.hasOwnProperty(prop)) {
                    if (typeof testObject[prop] === 'function' && prop.indexOf("test") === 0) {
                        utils.clearTotaliser(totaliser);
                        testObject.run(prop);
                        utils.sumTotaliser(totaliser, accumulated);
                        results.push({ name: prop, summary: utils.cloneTotaliser(totaliser) });
                    }
                }
            }
        },

        summary: function () {
            return { name: name, summary: accumulated, tests: results };
        }
    };
};

clutch.unittests = function (arrayOfUnitTests) {
    var utils = clutch.testutils;
    var results = [];
    var accumulated = utils.createTotaliser();

    return {
        run: function () {
            var length = arrayOfUnitTests.length;
            var unitTest = null;
            var unitTestSummary = null;

            for (var i = 0; i < length; i += 1) {
                unitTest = arrayOfUnitTests[i];
                unitTest.run();
                unitTestSummary = unitTest.summary();
                results.push(unitTestSummary);
                unitTestSummary = unitTestSummary.summary;
                utils.sumTotaliser(unitTestSummary, accumulated);
            }
        },


        summary: function () {
            return { summary: accumulated, tests: results };
        }
    };
};