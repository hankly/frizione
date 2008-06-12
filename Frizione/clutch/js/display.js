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
/*global Ajax, Builder, $ */
/*members Request, bottom, class, errors, evalJSON, failures, getTime,
    insert, length, message, messages, method, name, nocache, node, observe,
    onFailure, onSuccess, parameters, push, responseText, summary, tests,
    time, toFixed, toString, type */

function displayTestResults(summary) {

    function buildErrorReport(name, rows, attrs, type, tests) {
        var testsLength = tests.length;
        var test = null;
        var result = null;
        var functionName = null;
        var messages = null;
        var messagesLength = null;
        var message = null;
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
                            result.push(Builder.node('td', attrs, name));
                        }
                        else {
                            result.push(Builder.node('td', attrs, '\u00A0'));
                        }
                    }
                    if (functionName !== null) {
                        result.push(Builder.node('td', attrs, functionName));
                    }
                    else {
                        result.push(Builder.node('td', attrs, '\u00A0'));
                    }
                    result.push(Builder.node('td', attrs, Builder.node('pre', message.message)));
                    rows.push(Builder.node('tr', attrs, result));
                    functionName = null;
                }
            }
        }
    }

    function buildUnitTestsErrorReport(root, thead, attrs, type, tests) {
        var length = tests.length;
        var noAttrs = {};
        var rows = [];
        var testSummary = null;
        for (var i = 0; i < length; i += 1) {
            testSummary = tests[i];
            buildErrorReport(testSummary.name, rows, noAttrs, type, testSummary.tests);
        }
        root.insert({ bottom: Builder.node('table', attrs, [ thead, Builder.node('tbody', noAttrs, rows) ]) });
    }

    function buildUnitTestErrorReport(root, thead, attrs, type, tests) {
        var noAttrs = {};
        var rows = [];
        buildErrorReport(null, rows, noAttrs, type, tests);
        root.insert({ bottom: Builder.node('table', attrs, [ thead, Builder.node('tbody', noAttrs, rows) ]) });
    }

    function hasErrors(summary) {
        return summary.errors > 0 || summary.failures > 0;
    }

    function buildRow(name, attrs, elements) {
        var result = [];
        var length = elements.length;
        for (var i = 0; i < length; i += 1) {
            result.push(Builder.node(name, attrs, elements[i]));
        }
        return result;
    }

    function displaySummary(summary, root) {
        var rate = (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests;
        var noAttrs = {};
        var attrs = { 'class': 'test summary' };
        var headers = ["Tests", "Failures", "Errors", "Success Rate", "Time (ms)"];
        var info = [
            summary.tests.toString(), summary.failures.toString(), summary.errors.toString(),
            rate.toFixed(2) + "%", summary.time.toString()
        ];
        var node = Builder.node('table', attrs, [
            Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers))),
            Builder.node('tbody', noAttrs, Builder.node('tr', noAttrs, buildRow('td', noAttrs, info)))
        ]);

        root.insert({ bottom: Builder.node('p', attrs, 'Summary:') });
        root.insert({ bottom: node });
    }

    function displayUnitTest(summary, root, showSummary) {
        var totaliser = summary.summary;
        if (showSummary) {
            displaySummary(totaliser, root);
        }

        var name = summary.name;
        var noAttrs = {};
        var attrs = { 'class': 'test unit' };
        var headers = ["Function", "Tests", "Failures", "Errors", "Time (ms)"];
        var thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
        var rows = [];
        var tests = summary.tests;
        var length = tests.length;
        var testSummary = null;
        var info = null;
        var i = null;
        for (i = 0; i < length; i += 1) {
            testSummary = tests[i];
            summary = testSummary.summary;
            info = [
                testSummary.name, summary.tests.toString(), summary.failures.toString(),
                summary.errors.toString(), summary.time.toString()
            ];
            rows.push(Builder.node('tr', noAttrs, buildRow('td', noAttrs, info)));
        }
        root.insert({ bottom: Builder.node('p', attrs, "Unit Test: " + name) });
        root.insert({ bottom: Builder.node('table', attrs, [ thead, Builder.node('tbody', noAttrs, rows) ]) });

        if (showSummary && hasErrors(totaliser)) {
            headers = [ "Function", "Reason" ];
            if (totaliser.errors > 0) {
                attrs = { 'class': 'test errors' };
                root.insert({ bottom: Builder.node('p', attrs, "All errors:") });
                thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
                buildUnitTestErrorReport(root, thead, attrs, "error", tests);
            }
            if (totaliser.failures > 0) {
                attrs = { 'class': 'test failures' };
                root.insert({ bottom: Builder.node('p', attrs, "All failures:") });
                thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
                buildUnitTestErrorReport(root, thead, attrs, "fail", tests);
            }
        }
    }

    function displayUnitTests(summary, root, showSummary) {
        var totaliser = summary.summary;
        if (showSummary) {
            displaySummary(totaliser, root);
        }

        var attrs = { 'class': 'test unit' };
        var noAttrs = {};
        var headers = [ "Unit Test Name", "Tests", "Failures", "Errors", "Success Rate", "Time (ms)" ];
        var thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
        var rows = [];
        var tests = summary.tests;
        var length = tests.length;
        var testSummary = null;
        var rate = null;
        var info = null;
        var i = null;
        for (i = 0; i < length; i += 1) {
            testSummary = tests[i];
            summary = testSummary.summary;
            rate = (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests;
            info = [
                testSummary.name, summary.tests.toString(), summary.failures.toString(),
                summary.errors.toString(), rate.toFixed(2) + "%", summary.time.toString()
            ];
            rows.push(Builder.node('tr', noAttrs, buildRow('td', noAttrs, info)));
        }
        root.insert({ bottom: Builder.node('p', attrs, "Unit Tests Summary:") });
        root.insert({ bottom: Builder.node('table', attrs, [ thead, Builder.node('tbody', noAttrs, rows) ]) });

        for (i = 0; i < length; i += 1) {
            displayUnitTest(tests[i], root, false);
        }

        if (showSummary && hasErrors(totaliser)) {
            headers = [ "Unit Test Name", "Function", "Reason" ];
            if (totaliser.errors > 0) {
                attrs = { 'class': 'test errors' };
                root.insert({ bottom: Builder.node('p', attrs, "All errors:") });
                thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
                buildUnitTestsErrorReport(root, thead, attrs, 'error', tests);
            }
            if (totaliser.failures > 0) {
                attrs = { 'class': 'test failures' };
                root.insert({ bottom: Builder.node('p', attrs, "All failures:") });
                thead = Builder.node('thead', noAttrs, Builder.node('tr', noAttrs, buildRow('th', noAttrs, headers)));
                buildUnitTestsErrorReport(root, thead, attrs, 'fail', tests);
            }
        }
    }

    var root = $('test-results');
    if (summary.name) {
        displayUnitTest(summary, root, true);
    }
    else {
        displayUnitTests(summary, root, true);
    }
}

function retrieveAndDisplay(url) {

    document.observe('dom:loaded', function() {
        var request = new Ajax.Request(url, {
            method: 'get',
            parameters: { nocache: new Date().getTime() },
            onSuccess: function (transport) {
                var result = transport.responseText.evalJSON(true);
                displayTestResults(result);
            },
            onFailure: function () {
                alert("Failed to retrieve the unit test results.");
            }
        });
    });
}