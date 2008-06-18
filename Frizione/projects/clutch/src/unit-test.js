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
/*global clutch, google */

if (!this.clutch) {
    clutch = {};
}

clutch.test  = {};

clutch.test.utils = {

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

clutch.test.assertions = function (totaliser) {

    return {

        log: function (message) {
            totaliser.logs += 1;
            totaliser.messages.push({ type: 'log', message: message });
        },

        pass: function () {
            totaliser.tests += 1;
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
            if (error.fileName && error.lineNumber && error.stack) {
                message = error.fileName + '(' + error.lineNumber + ') ' + message + '\n' + error.stack;
            }
            else if (error.fileName && error.lineNumber) {
                message = error.fileName + '(' + error.lineNumber + ') ' + message;
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
        }
    };
};

clutch.test.runner = function (profile, timeout) {
    var timer = null;
    var timerId = null;
    var setTimeout = null;
    var clearTimeout = null;
    var functionAssertions = null;
    var callbackAssertions = null;
    var callbacks = null;

    function cleanUp() {
        var i = 0;
        var total = profile.total;
        var removeProps = clutch.test.utils.removeTotaliserProperties;
        for (; i < total; i += 1) {
            removeProps(profile.tests[i]);
        }
    }

    function abend(reason) {
        if (timerId) {
            clearTimeout(timerId);
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

    function wrapCallback(testObject, callbackFunc, func, cbIndex, index) {

        return function () {

            var prop = null;
            for (prop in callbackAssertions) {
                if (callbackAssertions.hasOwnProperty(prop)) {
                    testObject[prop] = callbackAssertions[prop];
                }
            }

            var test = profile.tests[index];
            test.func = callbackFunc + " <- " + func;
            test.callback = callbackFunc;

            var startAt = new Date().getTime();
            try {
                try {
                    startAt = new Date().getTime();
                    callbacks[cbIndex].apply(testObject, arguments);
                }
                finally {
                    test.time += (new Date().getTime() - startAt);
                }
            }
            catch(e) {
                testObject.error(e);
                testObject.tearDown();
             }

            for (prop in functionAssertions) {
                if (functionAssertions.hasOwnProperty(prop)) {
                    testObject[prop] = functionAssertions[prop];
                }
            }
            test = profile.tests[index];
            test.complete = true;
        };
    }

    function testFunctionAndCallbacks(test, next) {
        var testObject = test.testObject;
        var callback = null;
        var length = test.callbacks.length;
        var i = 0;
        var index = profile.index + 1;
        callbackAssertions = clutch.test.assertions(profile.tests[index]);
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
                testObject.tearDown();

                profile.index += 2;
                setTimeout(next, 0);
            }
            setTimeout(waitForCallback, 50);
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
        catch(e1) {
            testObject.error(e1);
            testObject.tearDown();
        }

        setTimeout(waitForCallback, 50);
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
        catch(e2) {
            testObject.error(e2);
        }

        profile.index += 1;
        setTimeout(next, 0);
    }

    function next() {
        if (profile.index >= profile.total) {
            if (timerId) {
                clearTimeout(timerId);
            }
            cleanUp();
            profile.complete = true;
            return;
        }

        var test = profile.tests[profile.index];
        var testObject = test.testObject;
        var prop = null;
        functionAssertions = clutch.test.assertions(test);
        for (prop in functionAssertions) {
            if (functionAssertions.hasOwnProperty(prop)) {
                testObject[prop] = functionAssertions[prop];
            }
        }

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

    return {
        run: function () {
            profile.complete = false;
            profile.index = 0;
            profile.total = profile.tests.length;
            try {
                timer = google.gears.factory.create('beta.timer');
                setTimeout = timer.setTimeout;
                clearTimeout = timer.clearTimeout;
            }
            catch (e) {
                setTimeout = window.setTimeout;
                clearTimeout = window.clearTimeout;
            }
            if (timeout > 0) {
                setTimeout(timedOut, timeout);
            }
            setTimeout(next, 0);
        },

        abort: function (reason) {
            abend(reason);
        },

        check: function () {
            return { complete: profile.complete, abend: profile.abend, index: profile.index, total: profile.total };
        }
    };
};

clutch.test.unit = function (name, testObject, timeout) {
    var utils = clutch.test.utils;
    var profile = null;
    var tests = [];
    var runner = null;

    return {

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
            if (testObject.clutchTests) {
                testArray = testObject.clutchTests;
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

        run : function () {
            if (!profile) {
                this.prepare();
            }
            runner = clutch.test.runner(profile, timeout);
            runner.run();
        },

        abort: function () {
            runner.abort();
        },

        check: function () {
            return runner.check();
        },

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
};

clutch.test.group = function (arrayOfUnitTests, timeout) {
    var utils = clutch.test.utils;
    var profile = null;
    var runner = null;

    return {

        prepare: function () {
            profile = utils.createProfile();
            var length = arrayOfUnitTests.length;
            var unitTest = null;
            var i = null;
            for (i = 0; i < length; i += 1) {
                unitTest = arrayOfUnitTests[i];
                unitTest.prepare(profile);
            }
        },

        run: function () {
            if (!profile) {
                this.prepare();
            }
            runner = clutch.test.runner(profile, timeout);
            runner.run();
        },

        abort: function () {
            runner.abort();
        },

        check: function () {
            return runner.check();
        },

        summarise: function () {
            var total = utils.createTotaliser();
            var results = [];
            var length = arrayOfUnitTests.length;
            var unitTest = null;
            var unitSummary = null;
            var i = null;
            for (i = 0; i < length; i += 1) {
                unitTest = arrayOfUnitTests[i];
                unitSummary = unitTest.summarise();
                utils.sumTotaliser(unitSummary.summary, total);
                results.push(unitSummary);
            }
            utils.removeTotaliserProperties(total);
            return { abend: profile.abend, summary: total, tests: results };
        }
    };
};