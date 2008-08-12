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

/**
 * @requires crash.xml, crash.st
 */

if (!this.crash.test) {
    crash.test = {};
}

/*
 * Creates an HTML document report of the unit test summary.
 *
 * @param {Object} report the unit test summary.
 * @param {Object} result the unit test report.
 * @result {String} the HTML document.
 */
crash.test.htmlReport = function (report, result) {
    var xml = crash.xml;

    /**
     * Creates the unit test error report.
     *
     * @param {String} name the test name.
     * @param {Array} rows the table rows.
     * @param {Object} attrs the element attributes to use.
     * @param {String} type the error type.
     * @param {Array} tests the unit test results.
     */
    function errorReport(name, rows, type, tests) {
        var testsLength = tests.length;
        var test = null;
        var result = null;
        var functionName = null;
        var messages = null;
        var messagesLength = null;
        var message = null;
        var noAttrs = {};
        var i = null;
        var j = null;
        for (i = 0; i < testsLength; i += 1) {
            test = tests[i];
            functionName = test.name;
            messages = test.summary.messages;
            messagesLength = messages.length;
            for (j = 0; j < messagesLength; j += 1) {
                message = messages[j];
                if (message.type === type) {
                    result = [];
                    if (name !== null) {
                        if (functionName !== null) {
                            result.push(xml.buildNode('td', noAttrs, name));
                        }
                        else {
                            result.push(xml.buildNode('td', noAttrs, '\u00A0'));
                        }
                    }
                    if (functionName !== null) {
                        result.push(xml.buildNode('td', noAttrs, functionName));
                    }
                    else {
                        result.push(xml.buildNode('td', noAttrs, '\u00A0'));
                    }
                    result.push(xml.buildNode('td', noAttrs, xml.buildNode('pre', noAttrs, message.message), false));
                    rows.push(xml.buildNode('tr', noAttrs, result.join(''), false));
                    functionName = null;
                }
            }
        }
    }

    /**
     * Creates the multiple unit tests error report.
     *
     * @param {String} type the error type.
     * @param {Array} tests the unit test results.
     * @return {Array} the error report rows.
     */
    function unitGroupErrorReport(type, tests) {
        var rows = [];
        var length = tests.length;
        var summary = null;
        for (var i = 0; i < length; i += 1) {
            summary = tests[i];
            errorReport(summary.name, rows, type, summary.tests);
        }
        return rows;
    }

    /**
     * Creates the unit test error report.
     *
     * @param {String} type the error type.
     * @param {Array} tests the unit test results.
     * @return {Array} the error report rows.
     */
    function unitTestErrorReport(type, tests) {
        var rows = [];
        errorReport(null, rows, type, tests);
        return rows;
    }

    /*
     * Creates the unit test summary.
     *
     * @param {Object} report the unit test summary.
     * @param {Object} result the unit test report.
     */
    function summaryReport(report, result) {
        if (report.abend) {
            result.abend = 'Testing terminated abnormally: ' + report.abend;
        }

        var summary = report.summary;
        var rate = summary.tests ? (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests : 0.0;
        var stats = [
            summary.tests.toString(), summary.failures.toString(), summary.errors.toString(),
            rate.toFixed(2) + "%", summary.time.toString(), summary.date
        ];
        result.summary = xml.buildNodeArray('td', {}, stats);
    }

    /**
     * Creates a report for a single unit test.
     *
     * @param {Object} report the unit test report.
     * @param {Object} result the unit test report.
     * @param {boolean} showSummary a flag to display the summary.
     */
    function unitTestReport(report, result, showSummary) {
        if (showSummary) {
            summaryReport(report, result);
        }

        var totaliser = report.summary;
        result.name = report.name;
        var noAttrs = {};
        var rows = [];
        var tests = report.tests;
        var length = tests.length;
        var test = null;
        var summary = null;
        var stats = null;
        var i = null;
        for (i = 0; i < length; i += 1) {
            test = tests[i];
            summary = test.summary;
            stats = [
                test.name, summary.tests.toString(), summary.failures.toString(),
                summary.errors.toString(), summary.time.toString()
            ];
            rows.push(xml.buildNode('tr', noAttrs, xml.buildNodeArray('td', noAttrs, stats), false));
        }
        result.results = "                " + rows.join("\n                ");

        if (showSummary) {
            if (totaliser.errors > 0) {
                rows = unitTestErrorReport("error", tests);
                result.errors = "                " + rows.join("\n                ");
            }
            if (totaliser.failures > 0) {
                rows = unitTestErrorReport("fail", tests);
                result.failures = "                " + rows.join("\n                ");
            }
            if (totaliser.logs > 0) {
                rows = unitTestErrorReport("log", tests);
                result.logs = "                " + rows.join("\n                ");
            }
        }
    }

    /**
     * Creates a report for multiple unit tests.
     *
     * @param {Object} report the unit test report.
     * @param {Object} result the unit test report.
     * @param {boolean} showSummary a flag to display the summary.
     */
    function unitGroupReport(report, result, showSummary) {
        if (showSummary) {
            summaryReport(report, result);
        }

        var totaliser = report.summary;
        var noAttrs = {};
        var rows = [];
        var tests = report.tests;
        var length = tests.length;
        var test = null;
        var summary = null;
        var rate = null;
        var stats = null;
        var i = null;
        for (i = 0; i < length; i += 1) {
            test = tests[i];
            summary = test.summary;
            rate = summary.tests ? (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests : 0.0;
            stats = [
                test.name, summary.tests.toString(), summary.failures.toString(),
                summary.errors.toString(), rate.toFixed(2) + "%", summary.time.toString()
            ];
            rows.push(xml.buildNode('tr', noAttrs, xml.buildNodeArray('td', noAttrs, stats), false));
        }
        result.results = "                " + rows.join("\n                ");

        result.tests = [];
        for (i = 0; i < length; i += 1) {
            result.tests[i] = {};
            unitTestReport(tests[i], result.tests[i], false);
        }

        if (showSummary) {
            if (totaliser.errors > 0) {
                rows = unitGroupErrorReport('error', tests);
                result.errors = "                " + rows.join("\n                ");
            }
            if (totaliser.failures > 0) {
                rows = unitGroupErrorReport('fail', tests);
                result.failures = "                " + rows.join("\n                ");
            }
            if (totaliser.logs > 0) {
                rows = unitGroupErrorReport('log', tests);
                result.logs = "                " + rows.join("\n                ");
            }
        }
    }

    var resource = result.document || crash.resource("crash/unit-test/html/document.html");
    if (!result.head) {
        result.head = "./head.html";
    }
    if (!result.body) {
        result.body = "./body.html";
    }

    if (!result.relative) {
        result.relative = "./";
    }
    if (report.name) {
        result.report = result.relative + "unittest.html";
        unitTestReport(report, result, true);
    }
    else {
        result.report = result.relative + "grouptest.html";
        unitGroupReport(report, result, true);
    }

    return crash.st.load(resource, result, "UTF-8", '<');
};