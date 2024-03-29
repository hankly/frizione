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

if (!this.crash.test) {

    /**
     * @namespace Specialised functions for unit testing.
     */
    crash.test = {};
}

// I know, I know - yet another unit testing framework. Well, the world is large, so there's always space for one more.
// Did I know about JSUnit (http://www.jsunit.net/), yes I did.
// Did I know about RhinoUnit (http://code.google.com/p/rhinounit/), yes I did.
// Did I know about Dojo Doh (http://dojotoolkit.org/book/dojo-book-0-9/part-4-meta-dojo/d-o-h-unit-testing), yes I did.
// Did I know about Prototype testing (http://www.prototypejs.org/ it's in the svn repository), yes I did.
// Did I know about testcase (http://rubyforge.org/projects/testcase/), oops, no - damn.
// And I still did my own. There's tenacity for you. Ok, maybe not tenacity...

// But why? I mean I really don't like writing reams of code.
// ...

// Set of utility functions for the unit test report information.
crash.test.utils = {

    createTotaliser: function () {
        return {
            complete: false,
            tests: 0,
            logs: 0,
            failures: 0,
            errors: 0,
            time: 0,
            abend: null,
            messages: []
        };
    },

    sumTotaliser: function (from, to) {
        to.tests += from.tests;
        to.logs += from.logs;
        to.failures += from.failures;
        to.errors += from.errors;
        to.time += from.time;
    },

    addTotaliserProperties: function (totaliser, name, testObject, func, callback, callbacks) {
        totaliser.name = name;
        totaliser.testObject = testObject;
        totaliser.func = func;
        totaliser.callback = callback;
        totaliser.callbacks = callbacks;
    },

    removeTotaliserProperties: function (totaliser) {
        delete totaliser.complete;
        delete totaliser.name;
        delete totaliser.testObject;
        // delete totaliser.func;
        // delete totaliser.callback;
        delete totaliser.callbacks;
    },

    createProfile: function () {
        return {
            complete: false,
            index: 0,
            total: 0,
            abend: null,
            tests: []
        };
    }
};

crash.test.assertions = function (totaliser) {

    /**
     * @class The testing assertions.
     * These functions are injected into the test object.
     *
     * @name crash.test.asserts
     */
    var assertions = /** @scope crash.test.asserts.prototype */ {

        /**
         * Logs a message.
         *
         * @param {String} message the message to log.
         */
        log: function (message) {
            totaliser.logs += 1;
            totaliser.messages.push({ type: 'log', message: message });
        },

        pass: function () {
            totaliser.tests += 1;
        },

        /**
         * Indicates that the unit test function failed.
         *
         * @param {String} message the failure reason message.
         */
        fail: function (message) {
            totaliser.tests += 1;
            totaliser.failures += 1;
            totaliser.messages.push({ type: "fail", message: message });
        },

        error: function (error) {
            totaliser.tests += 1;
            totaliser.errors += 1;
            var message = error.name + ': ' + error.message;
            if (error.filename && error.lineNumber && error.stack) {
                message = error.filename + '(' + error.lineNumber + ') ' + message + '\n' + error.stack;
            }
            else if (error.filename && error.lineNumber) {
                message = error.filename + '(' + error.lineNumber + ') ' + message;
            }
            totaliser.messages.push({ type: "error", message: message });
        },

        /**
         * Asserts that a specific condition is valid (<code>true</code>).
         *
         * @param {Code} condition the condition to test, something like <code>result === 2</code>.
         * @param {String} message the message to log if the condition does <b>not</b> resolve to <code>true</code>.
         */
        assert: function (condition, message) {
            try {
                if (condition) {
                    assertions.pass();
                }
                else {
                    message = message || "assert: " + condition;
                    assertions.fail(message);
                }
            }
            catch(e) {
                assertions.error(e);
            }
        }
    };
    return assertions;
};

/*
 * This monster runs the unit tests. Since introducing asynchronous unit testing this piece of code has
 * grown exponentially. I'd really like to get it back down to a humane size, before it implodes under
 * its own weight.
 *
 * @param profile the testing report.
 * @param timeout the maximum time in milliseconds for all tests to be executed.
 */
crash.test.runner = function (profile, timeout) {
    var timerId = null;
    var intervalId = null;
    var functionAssertions = null;
    var callbackAssertions = null;
    var callbacks = null;

    /** @ignore */
    function setTestTimeout(code, millis) {
        return crash.timer.setTimeout(code, millis);
    }
    /** @ignore */
    function setTestInterval(code, millis) {
        return crash.timer.setInterval(code, millis);
    }
    /** @ignore */
    function clearTestTimeout(timerId) {
        crash.timer.clearTimeout(timerId);
    }
    /** @ignore */
    function clearTestInterval(timerId) {
        crash.timer.clearInterval(timerId);
    }

    function cleanUp() {
        var i = 0;
        var total = profile.total;
        var removeProps = crash.test.utils.removeTotaliserProperties;
        for (; i < total; i += 1) {
            removeProps(profile.tests[i]);
        }
    }

    function abend(reason) {
        if (timerId) {
            clearTestTimeout(timerId);
        }
        if (intervalId) {
            clearTestInterval(intervalId);
        }

        reason = reason || "Terminated by User";
        profile.abend = reason;
        var i = profile.index;
        var total = profile.total;
        for (; i < total; i += 1) {
            profile.tests[i].abend = reason;
        }

        cleanUp();
        profile.index = profile.total;
        profile.complete = true;
    }

    function injectAssertions(testObject, assertions) {
        var prop = null;
        for (prop in assertions) {
            if (assertions.hasOwnProperty(prop)) {
                testObject[prop] = assertions[prop];
            }
        }
    }

    function wrapCallback(testObject, callbackFunc, func, callbackIndex, index) {
        return function () {
            var test = profile.tests[index];
            injectAssertions(testObject, callbackAssertions);
            test.func = callbackFunc + " <- " + func;
            test.callback = callbackFunc;

            var startAt = new Date().getTime();
            try {
                try {
                    startAt = new Date().getTime();
                    callbacks[callbackIndex].apply(testObject, arguments);
                }
                finally {
                    test.time += (new Date().getTime() - startAt);
                }
            }
            catch (e1) {
                testObject.error(e1);
                try {
                    testObject.tearDown();
                }
                catch (e2) {
                    testObject.error(e2);
                }
             }

            injectAssertions(testObject, functionAssertions);
            test.complete = true;
        };
    }

    function testFunctionAndCallbacks(test, next) {
        var testObject = test.testObject;
        var callback = null;
        var length = test.callbacks.length;
        var i = 0;
        var index = profile.index + 1;
        callbackAssertions = crash.test.assertions(profile.tests[index]);
        callbacks = [];
        for (; i < length; i += 1) {
            callback = test.callbacks[i];
            callbacks.push(testObject[callback]);
            testObject[callback] = wrapCallback(testObject, callback, test.func, i, index);
        }

        function waitForCallback() {
            if (profile.complete) {
                return;
            }

            var testFunction = profile.tests[profile.index];
            var testCallback = profile.tests[profile.index + 1];
            if (testCallback.complete) {
                var testObject = testFunction.testObject;
                var length = testFunction.callbacks.length;
                var i = 0;
                for (; i < length; i += 1) {
                    testObject[testFunction.callbacks[i]] = callbacks[i];
                }

                profile.index += 2;
                clearTestInterval(intervalId);
                intervalId = null;
                setTestTimeout(next, 0);
            }
        }

        var startAt = new Date().getTime();
        try {
            try {
                testObject.setUp();
                startAt = new Date().getTime();
                testObject[test.func]();
            }
            finally {
                test.time += (new Date().getTime() - startAt);
            }
        }
        catch (e1) {
            testObject.error(e1);
            try {
                testObject.tearDown();
            }
            catch (e2) {
                testObject.error(e2);
            }
        }

        intervalId = setTestInterval(waitForCallback, 100);
    }

    function testFunction(test, next) {
        var testObject = test.testObject;
        var startAt = new Date().getTime();

        try {
            try {
                testObject.setUp();
                startAt = new Date().getTime();
                testObject[test.func]();
            }
            finally {
                test.time += (new Date().getTime() - startAt);
                testObject.tearDown();
            }
        }
        catch (e1) {
            testObject.error(e1);
        }

        profile.index += 1;
        setTestTimeout(next, 0);
    }

    function next() {
        if (profile.index >= profile.total) {
            if (timerId) {
                clearTestTimeout(timerId);
            }
            if (intervalId) {
                clearTestInterval(intervalId);
            }
            cleanUp();
            profile.complete = true;
            return;
        }

        var test = profile.tests[profile.index];
        var testObject = test.testObject;
        functionAssertions = crash.test.assertions(test);
        injectAssertions(testObject, functionAssertions);

        if (test.callbacks) {
            testFunctionAndCallbacks(test, next);
        }
        else {
            testFunction(test, next);
        }
    }

    function timedOut() {
        abend("Testing timeout (" + timeout + " ms) expired");
    }

    var runner = {
        
        run: function () {
            profile.complete = false;
            profile.index = 0;
            profile.total = profile.tests.length;

            if (timeout > 0) {
                timerId = setTestTimeout(timedOut, timeout);
            }
            setTestTimeout(next, 0);
        },

        abort: function (reason) {
            abend(reason);
        },

        check: function () {
            return { complete: profile.complete, abend: profile.abend, index: profile.index, total: profile.total };
        }
    };
    return runner;
};

/**
 * Creates a unit test object.
 *
 * @param {String} name the unit test name.
 * @param {Object} testObject the test object.
 * @param {Number} timeout the (optional) maximum time in milliseconds for all the tests to be executed.
 * @return {crash.test.unitTester} the unit tester object.
 */
crash.test.unit = function (name, testObject, timeout) {
    var utils = crash.test.utils;
    var profile = null;
    var tests = [];
    var runner = null;

    /**
     * @class The unit testing object.
     * This object is created by {@link crash.test.unit}.
     *
     * @name crash.test.unitTester
     */
    var tester = /** @scope crash.test.unitTester.prototype */ {

        prepare: function (parentProfile) {
            if (parentProfile) {
                profile = parentProfile;
            }
            else {
                profile = utils.createProfile();
            }

            var i = null;
            var length = null;
            var testArray = null;
            var test = null;
            var prop = null;
            var totaliser = null;
            if (testObject.crashTests) {
                testArray = testObject.crashTests;
                length = testArray.length;
                for (i = 0; i < length; i += 1) {
                    test = testArray[i];
                    totaliser = utils.createTotaliser();
                    utils.addTotaliserProperties(totaliser, name, testObject, test.func, null, test.callbacks);
                    profile.tests.push(totaliser);
                    tests.push(totaliser);

                    if (totaliser.callbacks) {
                        totaliser = utils.createTotaliser();
                        utils.addTotaliserProperties(totaliser, name, testObject, 'callback <- ' + test.func, null, null);
                        profile.tests.push(totaliser);
                        tests.push(totaliser);
                    }
                }
            }
            else {
                for (prop in testObject) {
                    if (testObject.hasOwnProperty(prop) &&
                            typeof testObject[prop] === 'function' &&
                            prop.indexOf("test") === 0) {
                        totaliser = utils.createTotaliser();
                        utils.addTotaliserProperties(totaliser, name, testObject, prop, null, null);
                        profile.tests.push(totaliser);
                        tests.push(totaliser);
                    }
                }
            }

            if (!testObject.setUp) {
                testObject.setUp = function () {};
            }
            if (!testObject.tearDown) {
                testObject.tearDown = function () {};
            }
        },

        /**
         * Runs the unit tests.
         */
        run : function () {
            if (!profile) {
                this.prepare();
            }
            runner = crash.test.runner(profile, timeout);
            runner.run();
        },

        abort: function () {
            runner.abort();
        },

        /**
         * Checks the status of the unit tests being run.
         * Returns a status object with four fields:
         * <ul>
         *   <li><code>complete</code> - a boolean which is set to <code>true</code> when all tests are complete.</li>
         *   <li><code>abend</code> - a string which is set if an abnormal condition (such as unit testing timeout) occurred.</li>
         *   <li><code>index</code> - a number indiciating the index of the current unit test being run.</li>
         *   <li><code>total</code> - a number indicating the total number of unit tests to be run.</li>
         * </ul>
         *
         * @return {Object} the current unit test status.
         */
        check: function () {
            return runner.check();
        },

        /**
         * Produces a summary object of the unit tests performed. This function should only be called when the
         * unit tests have completed.
         * The summary object contains four fields:
         * <ul>
         *   <li><code>name</code> - a string set to the unit test name.</li>
         *   <li><code>abend</code> - a string which is set if an abnormal condition (such as unit testing timeout) occurred.</li>
         *   <li><code>summary</code> - an object containing the actual summary information.</li>
         *   <li><code>tests</code> - an object containing individual test function results.</li>
         * </ul>
         *
         * @return {Object} the summary object.
         */
        summarise: function () {
            var results = [];
            var total = utils.createTotaliser();
            var length = tests.length;
            var test = null;
            var i = null;
            for (i = 0; i < length; i += 1) {
                test = tests[i];
                utils.sumTotaliser(test, total);
                results.push({ name: test.func, summary: test });
            }
            utils.removeTotaliserProperties(total);
            return { name: name, abend: profile.abend, summary: total, tests: results };
        }
    };
    return tester;
};

/**
 * Creates a group of unit tests object.
 *
 * @param {Array} testArray the unit test array.
 * @param {Number} timeout the (optional) maximum time in milliseconds for all unit tests to be executed.
 * @return {crash.test.groupTester} the group unit tester object.
 */
crash.test.group = function (tests, timeout) {
    var utils = crash.test.utils;
    var profile = null;
    var runner = null;

    /**
     * @class The group unit testing object.
     * This object is created by {@link crash.test.group}.
     *
     * @name crash.test.groupTester
     */
    var tester = /** @scope crash.test.groupTester.prototype */ {

        prepare: function () {
            profile = utils.createProfile();
            var length = tests.length;
            var unitTest = null;
            var i = null;
            for (i = 0; i < length; i += 1) {
                unitTest = tests[i];
                unitTest.prepare(profile);
            }
        },

        /**
         * Runs the group of unit tests.
         */
        run: function () {
            if (!profile) {
                this.prepare();
            }
            runner = crash.test.runner(profile, timeout);
            runner.run();
        },

        abort: function () {
            runner.abort();
        },

        /**
         * Checks the status of the group unit tests being run.
         * Returns a status object with four fields:
         * <ul>
         *   <li><code>complete</code> a boolean which is set to <code>true</code> when all tests are complete.</li>
         *   <li><code>abend</code> a string which is set if an abnormal condition (such as unit testing timeout) occurred.</li>
         *   <li><code>index</code> a number indiciating the index of the current unit test being run.</li>
         *   <li><code>total</code> a number indicating the total number of unit tests to be run.</li>
         * </ul>
         *
         * @return {Object} the current unit test status.
         */
        check: function () {
            return runner.check();
        },

        /**
         * Produces a summary object of the group unit tests performed. This function should only be called when the
         * group unit tests have completed.
         * The summary object contains three fields:
         * <ul>
         *   <li><code>abend</code> - a string which is set if an abnormal condition (such as unit testing timeout) occurred.</li>
         *   <li><code>summary</code> - an object containing the actual summary information.</li>
         *   <li><code>tests</code> - an object containing individual unit test results.</li>
         * </ul>
         *
         * @return {Object} the summary object.
         */
        summarise: function () {
            var total = utils.createTotaliser();
            var results = [];
            var length = tests.length;
            var unitTest = null;
            var unitSummary = null;
            var i = null;
            for (i = 0; i < length; i += 1) {
                unitTest = tests[i];
                unitSummary = unitTest.summarise();
                utils.sumTotaliser(unitSummary.summary, total);
                results.push(unitSummary);
            }
            utils.removeTotaliserProperties(total);
            return { abend: profile.abend, summary: total, tests: results };
        }
    };
    return tester;
};