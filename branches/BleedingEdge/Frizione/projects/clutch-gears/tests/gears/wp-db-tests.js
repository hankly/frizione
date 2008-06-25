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

// Just wrapper code, so that if 'beta.xxx' becomes 'gamma.xxx', or the namespace changes (is that really likely?)
// I won't have to hunt around in a lot of JavaScript files...

if (!this.clutch) {
    clutch = {};
}

clutch.isGearsInstalled = function () {
    if (window) {
        return window.google && google && google.gears;
    }
    else {
        return google && google.gears;        
    }
};

clutch.gearsFactory = function () {
    return google.gears.factory;
};

clutch.createGearsDatabase = function () {
    return google.gears.factory.create('beta.database');
};

clutch.createGearsDesktop = function () {
    return google.gears.factory.create('beta.desktop');
};

clutch.createGearsHttpRequest = function () {
    return google.gears.factory.create('beta.httprequest');
};

clutch.createGearsLocalServer = function () {
    return google.gears.factory.create('beta.localserver');
};

clutch.createGearsTimer = function () {
    return google.gears.factory.create('beta.timer');
};

clutch.createGearsWorkerPool = function () {
    return google.gears.factory.create('beta.workerpool');
};
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
if (!this.clutch.db) {
    clutch.db = {};
}

/**
 * Converts a ResultSet into an object.
 * The ResultSet is expected to contain a single row, or no row at all.
 *
 * @param result the ResultSet to convert.
 * @param columns the columns to extract.
 */
clutch.db.fromSingleRow = function (result, columns) {
    if (!result.isValidRow()) {
        result.close();
        return null;
    }
    var i = 0;
    var length = columns.length;
    var name = null;
    var value = {};
    for (i = 0; i < length; i += 1) {
        name = columns[i];
        value[name] = result.fieldByName(name);
    }
    result.close();
    return value;
};

/**
 * Converts a ResultSet into an object.
 * The ResultSet is expected to contain multiple rows, or no row at all.
 *
 * @param result the ResultSet to convert.
 * @param columns the columns to extract.
 */
clutch.db.fromRows = function (result, columns) {
    if (!result.isValidRow()) {
        result.close();
        return null;
    }
    var values = [];
    var i = 0;
    var length = columns.length;
    var name = null;
    var value = null;
    while (result.isValidRow()) {
        value = {};
        values.push(value);
        for (i = 0; i < length; i += 1) {
            name = columns[i];
            value[name] = result.fieldByName(name);
        }
        result.next();
    }
    result.close();
    return values;
};

/**
 * Prepares the optional parameter syntax for a SELECT query.
 * These include: where, groupBy, having, orderBy, limit and offset.
 *
 * @param params the optional parameters
 */
clutch.db.optionalQuery = function (params) {
    var query = "";
    if (params) {
        if (params.where) {
            query = ' WHERE ' + params.where;
        }
        if (params.groupBy) {
            query += ' GROUP BY ' + params.groupBy;
        }
        if (params.having) {
            query += ' HAVING ' + params.having;
        }
        if (params.orderBy) {
            query += ' ORDER BY ' + params.orderBy;
        }
        if (params.limit) {
            query += ' LIMIT ' + params.limit;
            if (params.offset) {
                query += ' OFFSET ' + params.offset;
            }
        }
    }
    return query;
};
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
if (!this.clutch.db) {
    clutch.db = {};
}

/**
 * Database logger. Useful for debugging (especially in WorkerPools).
 *
 * @param name the name of the application database.
 */
clutch.db.logger = function (name) {

    var columns = [ 'id', 'name', 'value' ];
    var db = clutch.createGearsDatabase();
    db.open(name);
    db.execute('CREATE TABLE IF NOT EXISTS clutch_logger' +
               ' ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT(256), value TEXT(4096) )');

    return {

        log: function (name, value) {
            var result = db.execute('INSERT INTO clutch_logger (name, value) VALUES(?, ?)', [ name, value ]);
            result.close();
            return db.rowsAffected;
        },

        get: function (id) {
            var result = db.execute('SELECT id, name, value FROM clutch_logger WHERE id = ?', [ id ]);
            return clutch.db.fromSingleRow(result, columns);
        },

        list: function (params) {
            var query = clutch.db.optionalQuery(params);
            var result = db.execute('SELECT id, name, value FROM clutch_logger' + query);
            return clutch.db.fromRows(result, columns);
        },

        remove: function (id)  {
            var result = db.execute('DELETE FROM clutch_logger WHERE id = ?', [ id ]);
            result.close();
            return db.rowsAffected;
        },

        removeAll: function () {
            var result = db.execute('DELETE FROM clutch_logger WHERE 1');
            result.close();
            return db.rowsAffected;
        }
    };
};
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
/*global clutch, google, createXhrTests, runXhrTests */

function createDatabaseTests() {
    var logger = null;

    return clutch.test.unit('Database Tests', {

        clutchTests: [
            { func: 'clearDatabase', callbacks: null },
            { func: 'addRows', callbacks: null },
            { func: 'readRowsAsc', callbacks: null },
            { func: 'readRowsDesc', callbacks: null },
            { func: 'readRowsLimit', callbacks: null }
        ],

        setUp: function () {
            if (logger === null) {
                logger = clutch.db.logger('clutch_gears');
            }
        },

        clearDatabase: function () {
            logger.removeAll();
            var rows = logger.list();
            this.assert(rows === null, "Logger database should have no rows");
        },

        addRows: function () {
            var index = 1;
            var last = 10;
            var rowsAffected = null;
            for (index = 1; index <= last; index += 1) {
                rowsAffected = logger.log("log", "test value = " + index);
                this.assert(rowsAffected === 1, "Rows affected by log() !== 1");
            }
        },

        readRowsAsc: function () {
            var results = logger.list({ orderBy: 'id ASC' });
            this.assert(results.length === 10, "Should have read 10 rows, but read " + results.length);
            var index = 1;
            var last = 10;
            var result = null;
            for (index = 1; index <= last; index += 1) {
                result = results[index - 1];
                this.assert(result.value === ("test value = " + index),
                        "Row[" + index + "].value should have been 'test value = " + index +
                        "', but was '" + result.value + "'");
            }
        },

        readRowsDesc: function () {
            var results = logger.list({ orderBy: 'id DESC' });
            this.assert(results.length === 10, "Should have read 10 rows, but read " + results.length);
            var index = 10;
            var result = null;
            for (index = 10; index >= 1; index -= 1) {
                result = results[10 - index];
                this.assert(result.value === ("test value = " + index),
                        "Row[" + (11 - index) + "].value should have been 'test value = " + index +
                        "', but was '" + result.value + "'");
            }
        },

        readRowsLimit: function () {
            var results = logger.list({ orderBy: 'id ASC', limit: 4, offset: 2 });
            this.assert(results.length === 4, "Should have read 4 rows, but read " + results.length);
            var index = 3;
            var last = 6;
            var result = null;
            for (index = 3; index <= last; index += 1) {
                result = results[index - 3];
                this.assert(result.value === ("test value = " + index),
                        "Row[" + index + "].value should have been 'test value = " + index +
                        "', but was '" + result.value + "'");
            }
        }
    }, 5000);
}

function runClutchTests() {
    return createDatabaseTests();
}
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

if (!this.clutch.test) {
    clutch.test = {};
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

/**
 * The testing assertions. These functions are injected into the test object.
 *
 * @param totaliser the unit test totaliser (report).
 */
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
            if (error.filename && error.lineNumber && error.stack) {
                message = error.filename + '(' + error.lineNumber + ') ' + message + '\n' + error.stack;
            }
            else if (error.filename && error.lineNumber) {
                message = error.filename + '(' + error.lineNumber + ') ' + message;
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

/**
 * This monster runs the unit tests. Since introducing asynchronous unit testing this piece of code has
 * grown exponentially. I'd really like to get it back down to a humane size, before it implodes under
 * its own weight.
 *
 * @param profile the testing report.
 * @param timeout the maximum time in milliseconds for all tests to be executed.
 */
clutch.test.runner = function (profile, timeout) {
    var gearsTimer = null;
    var timerId = null;
    var setTestTimeout = null;
    var clearTestTimeout = null;
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
            clearTestTimeout(timerId);
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

                profile.index += 2;
                setTestTimeout(next, 0);
            }
            else {
                setTestTimeout(waitForCallback, 100);
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

        setTestTimeout(waitForCallback, 100);
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
            cleanUp();
            profile.complete = true;
            return;
        }

        var test = profile.tests[profile.index];
        var testObject = test.testObject;
        functionAssertions = clutch.test.assertions(test);
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

    return {
        run: function () {
            // don't try to simplify this stuff, setTestTimeout = window.setTimeout causes all sorts of problems
            // with Opera and Firefox (which actually crashes)
            if (this.window && window.setTimeout) {
                setTestTimeout = function (code, millis) {
                    return window.setTimeout(code, millis);
                };
                clearTestTimeout = function (timerId) {
                    window.clearTimeout(timerId);
                };
            }
            else {
                gearsTimer = clutch.createGearsTimer();
                setTestTimeout = function (code, millis) {
                    return gearsTimer.setTimeout(code, millis);
                };
                clearTestTimeout = function (timerId) {
                    gearsTimer.clearTimeout(timerId);
                };
            }

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
};

/**
 * Creates a unit test.
 * @param name the unit test name.
 * @param testObject the test object.
 * @param timeout the maximum time in milliseconds for all the tests to be executed.
 */
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

/**
 * Creates a group of unit tests.
 * @param arrayOfUnitTests the unit test array.
 * @param timeout the maximum time in milliseconds for all unit tests to be executed.
 */
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

/*
Inspired by Aaron Boodman's Worker2 micro project
See http://groups.google.com/group/gears-users/browse_thread/thread/62a021c62828b8e4/67f494497639b641
*/

/*jslint evil: true */
/*global clutch, google */

if (!this.clutch) {
    clutch = {};
}
if (!this.clutch.wp) {
    clutch.wp = {};
}

/**
 * Message handlers (functions) for specific commands.
 */
clutch.wp.handlers = {
    'default': function (message) {
        throw new Error("No message handler for '" + message.body.command + "'");
    }
};

/**
 * WorkerPool message handler.
 *
 * @param depr1 deprecated message contents (not used).
 * @param depr2 deprectaed sender id (not used).
 * @param message the message object.
 */
clutch.wp.onMessage = function (depr1, depr2, message) {
    var body = message.body;
    var handler = clutch.wp.handlers[body.command] || clutch.wp.handlers['default'];
    handler(message);
};
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

/*global clutch, runClutchTests */

(function () {
    var wp = google.gears.workerPool;
    var tests = runClutchTests();

    clutch.wp.handlers['clutch.test.run'] = function (message) {
        tests.run();
        wp.sendMessage({ command: 'clutch.test.status', status: tests.check() }, message.sender);
    };

    clutch.wp.handlers['clutch.test.status'] = function (message) {
        var status = tests.check();
        var summary = null;
        if (status.complete) {
            summary = tests.summarise();
        }
        wp.sendMessage({ command: 'clutch.test.status', status: status, summary: summary }, message.sender);
    };

    wp.onmessage = clutch.wp.onMessage;
})();
