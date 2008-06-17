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

clutch.test  = {};
clutch.test.utils = {
    createTotaliser: function () {
        return {
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

    addTotaliserProperties: function (totaliser, name, testObject, func, callBack, callBacks) {
        totaliser.name = name;
        totaliser.testObject = testObject;
        totaliser.func = func;
        totaliser.callBack = callBack;
        totaliser.callBacks = callBacks;
    },

    removeTotaliserProperties: function (totaliser) {
        delete totaliser.name;
        delete totaliser.testObject;
        // delete totaliser.func;
        delete totaliser.callBack;
        delete totaliser.callBacks;
    },

    createProfile: function () {
        return {
            complete: false,
            index: 0,
            total: 0,
            abend: null,
            tests: []
        }
    }
};

clutch.test.assertions = function (totaliser) {
    var passMessage = { type: 'pass', message: '' };

    return {
        log: function (message) {
            totaliser.logs += 1;
            totaliser.messages.push({ type: 'log', message: message });
        },

        pass: function () {
            totaliser.tests += 1;
            totaliser.messages.push(passMessage);
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
        }
    };
};

clutch.test.runner = function (profile, timeout) {
    var timer = null;
    var timerId = null;
    var setTimeout = null;
    var clearTimeout = null;

    function abend(reason) {
        if (timerId) {
            clearTimeout(timerId);
        }
        reason = reason || "Terminated by User";
        profile.abend = reason;
        var i = profile.index;
        var total = profile.total;
        for (; i < total; i += 1) {
            profile.tests[i].reason = reason;
        }
        profile.index = profile.total;
        profile.complete = true;
    }

    function next() {
        if (profile.index === profile.total) {
            if (timerId) {
                clearTimeout(timerId);
            }
            profile.complete = true;
            var i = 0;
            var total = profile.total;
            var cleanUp = clutch.test.utils.removeTotaliserProperties
            for (; i < total; i += 1) {
                cleanUp(profile.tests[i]);
            }
            return;
        }

        var test = profile.tests[profile.index];
        var testObject = test.testObject;
        var assertions = clutch.test.assertions(test);
        var prop = null;
        for (prop in assertions) {
            if (assertions.hasOwnProperty(prop)) {
                testObject[prop] = assertions[prop];
            }
        }
        if (test.callBacks) {

        }
        else {
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
            catch(e) {
                testObject.error(e);
            }
            profile.index += 1;
            setTimeout(next, 0);
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
            return { complete: profile.complete, index: profile.index, total: profile.total };
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
                    totaliser.name = name;
                    totaliser.testObject = testObject;
                    totaliser.func = test['function'];
                    totaliser.callBack = null;
                    totaliser.callBacks = test['callBacks'];
                    profile.tests.push(totaliser);
                    tests.push(totaliser);
                    if (totaliser.callBacks) {
                        totaliser = utils.createTotaliser();
                        totaliser.name = name;
                        totaliser.testObject = testObject;
                        totaliser.func = 'callback ' + test['function'];
                        totaliser.callBack = null;
                        totaliser.callBacks = null;
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
                        totaliser.name = name;
                        totaliser.testObject = testObject;
                        totaliser.func = prop;
                        totaliser.callBack = null;
                        totaliser.callBacks = null;
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
            return { name: name, summary: total, tests: results };
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
            return { summary: total, tests: results };
        }
    };
};