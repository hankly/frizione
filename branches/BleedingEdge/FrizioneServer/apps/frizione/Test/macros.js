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

/**
 * Sets the script tags for the test page.
 */
function setJavaScriptTags_macro() {
    var data = res.data;
    var type = data.testParams.type;
    var compressed = getProperty('compressed') === 'true';

    if (!data.hasErrors) {
        switch(type) {
            case 'gears':
                if (compressed) {
                    return '<script src="/frizione/js/gears-unittester.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="' + projectsMountPoint() + '/' + data.project.dir + data.to + '?nocache=' + new Date().getTime() + '" type="text/javascript" charset="utf-8"></script>';
                }
                else {
                    return '<script src="/frizione/js/gears_init.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/json2.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/xhr.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/unit-test.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/gears-saver.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="' + projectsMountPoint() + '/' + data.project.dir + data.to + '?nocache=' + new Date().getTime() + '" type="text/javascript" charset="utf-8"></script>';
                }

            case 'workerpool':
                if (compressed) {
                    return '<script src="/frizione/js/workerpool-unittester.cjs" type="text/javascript" charset="utf-8"></script>';
                }
                else {
                    return '<script src="/frizione/js/gears_init.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/json2.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/xhr.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/wp-saver.cjs" type="text/javascript" charset="utf-8"></script>'
                }

            default:
                if (compressed) {
                    return '<script src="/frizione/js/browser-unittester.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="' + projectsMountPoint() + '/' + data.project.dir + data.to + '?nocache=' + new Date().getTime() + '" type="text/javascript" charset="utf-8"></script>';
                }
                else {
                    return '<script src="/frizione/js/json2.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/xhr.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/unit-test.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="/frizione/js/saver.cjs" type="text/javascript" charset="utf-8"></script>'
                         + '<script src="' + projectsMountPoint() + '/' + data.project.dir + data.to + '?nocache=' + new Date().getTime() + '" type="text/javascript" charset="utf-8"></script>';
                }
        }
    }
}

/**
 * Sets the body tag for the test page.
 */
function setBodyTag_macro() {
    var data = res.data;
    var type = data.testParams.type;
    var params = data.testParams;

    if (!data.hasErrors) {
        var frizione = "/frizione/" + data.project.dir + '/';
        var project = projectsMountPoint() + '/' + data.project.dir;
        switch(type) {
            case 'workerpool':
                var func = 'onload=\'clutch.storeTests("'
                        + project + params.to
                        + '", "'
                        + frizione + "writefixture" + params.json
                        + '", "'
                        + frizione + "jsontest" + params.json
                        + '");\'';
                return '<body ' + func + '>';

            default:
                var func = 'onload=\'clutch.storeTests(runClutchTests, "'
                        + frizione + "writefixture" + params.json
                        + '", "'
                        + frizione + "jsontest" + params.json
                        + '");\'';
                return '<body ' + func + '>';
        }
    }
    else {
        return '<body>';
    }
}

/**
  * Displays the unit test results.
  */
function displayTestResults_macro() {
    var json = res.data.json;

    if (json.name) {
        return this.displayUnitTest(json, true);
    }
    else {
        return this.displayUnitGroup(json, true);
    }
}

/**
 * Builds an element node.
 *
 * @param elem the element name.
 * @param attrs the element attributes.
 * @param text the element text.
 * @return the formatted element as a string.
 */
function buildNode(elem, attrs, text) {
    var elemText = "<" + elem;
    for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
            elemText += " " + attr + "='" + encode(attrs[attr]) + "'";
        }
   }
    elemText += ">" + text + "</" + elem + ">";
    return elemText;
}

/**
 * Builds the unit test error report.
 *
 * @param name the test name.
 * @param rows the table rows.
 * @param attrs the element attributes to use.
 * @param type the error type.
 * @param tests the unit test results.
 */
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
                        result.push(this.buildNode('td', attrs, name));
                    }
                    else {
                        result.push(this.buildNode('td', attrs, '\u00A0'));
                    }
                }
                if (functionName !== null) {
                    result.push(this.buildNode('td', attrs, functionName));
                }
                else {
                    result.push(this.buildNode('td', attrs, '\u00A0'));
                }
                result.push(this.buildNode('td', attrs, this.buildNode('pre', {}, message.message)));
                rows.push(this.buildNode('tr', attrs, result.join('')));
                functionName = null;
            }
        }
    }
}

/**
 * Buils the unit tests error report.
 *
 * @param thead the table header.
 * @param attrs the element attributes to use.
 * @param type the error type.
 * @param tests the unit test results.
 * @return the formatted report.
 */
function buildUnitTestsErrorReport(thead, attrs, type, tests) {
    var length = tests.length;
    var noAttrs = {};
    var rows = [];
    var testSummary = null;
    for (var i = 0; i < length; i += 1) {
        testSummary = tests[i];
        this.buildErrorReport(testSummary.name, rows, noAttrs, type, testSummary.tests);
    }
    return this.buildNode('table', attrs, [ thead, this.buildNode('tbody', noAttrs, rows.join('')) ].join(''));
}

/**
 * Buils the unit test error report.
 *
 * @param thead the table header.
 * @param attrs the element attributes to use.
 * @param type the error type.
 * @param tests the unit test results.
 * @return the formatted report.
 */
function buildUnitTestErrorReport(thead, attrs, type, tests) {
    var noAttrs = {};
    var rows = [];
    this.buildErrorReport(null, rows, noAttrs, type, tests);
    return this.buildNode('table', attrs, [ thead, this.buildNode('tbody', noAttrs, rows.join('')) ].join(''));
}

/**
 * Checks if there were logs, failures, or errors in the summary.
 *
 * @param summary the summary to check.
 * @return true if there were logs, failures, or errors, otherwise false.
 */
function hasErrors(summary) {
    return summary.logs > 0 || summary.errors > 0 || summary.failures > 0;
}

/**
 * Builds a table row.
 *
 * @param name the element name.
 * @param attrs the element attributes.
 * @param values the row element values.
 * @return the formatted row elements.
 */
function buildRow(name, attrs, values) {
    var result = [];
    var length = values.length;
    for (var i = 0; i < length; i += 1) {
        result.push(this.buildNode(name, attrs, values[i]));
    }
    return result;
}

/**
 * Displays the unit test summary.
 *
 * @param summary the summary information.
 * @return the formatted summary.
 */
function displaySummary(summary) {
    var text = "";
    var attrs = { 'class': 'test summary errors' };
    if (summary.abend) {
        text += this.buildNode('p', attrs, 'Testing terminated abnormally: ' + summary.abend);
    }

    summary = summary.summary;
    attrs = { 'class': 'test summary' };
    var noAttrs = {};
    var rate = summary.tests ? (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests : 0.0;
    var headers = ["Tests", "Failures", "Errors", "Success Rate", "Time (ms)", "Date" ];
    var info = [
        summary.tests.toString(), summary.failures.toString(), summary.errors.toString(),
        rate.toFixed(2) + "%", summary.time.toString(), summary.date
    ];
    text += this.buildNode('p', attrs, 'Summary:');
    text += this.buildNode('table', attrs, [
        this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join(''))),
        this.buildNode('tbody', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('td', noAttrs, info).join('')))
    ].join(''));
    return text;
}

/**
 * Displays the report for a single unit test.
 *
 * @param json the test report.
 * @param showSummary a flag to display the summary.
 * @return the formatted report.
 */
function displayUnitTest(json, showSummary) {
    var text = "";
    if (showSummary) {
        text += this.displaySummary(json);
    }

    var totaliser = json.summary;
    var name = json.name;
    var noAttrs = {};
    var attrs = { 'class': 'test unit' };
    var headers = ["Function", "Tests", "Failures", "Errors", "Time (ms)"];
    var thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
    var rows = [];
    var tests = json.tests;
    var length = tests.length;
    var testSummary = null;
    var info = null;
    var i = null;
    for (i = 0; i < length; i += 1) {
        testSummary = tests[i];
        var summary = testSummary.summary;
        info = [
            testSummary.name, summary.tests.toString(), summary.failures.toString(),
            summary.errors.toString(), summary.time.toString()
        ];
        rows.push(this.buildNode('tr', noAttrs, this.buildRow('td', noAttrs, info).join('')));
    }
    text += this.buildNode('p', attrs, "Unit Test: " + name);
    text += this.buildNode('table', attrs, [ thead, this.buildNode('tbody', noAttrs, rows.join('')) ].join(''));

    if (showSummary && this.hasErrors(totaliser)) {
        headers = [ "Function", "Message" ];
        if (totaliser.errors > 0) {
            attrs = { 'class': 'test errors' };
            text += this.buildNode('p', attrs, "All errors:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestErrorReport(thead, attrs, "error", tests);
        }
        if (totaliser.failures > 0) {
            attrs = { 'class': 'test failures' };
            text += this.buildNode('p', attrs, "All failures:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestErrorReport(thead, attrs, "fail", tests);
        }
        if (totaliser.logs > 0) {
            attrs = { 'class': 'test logs' };
            text += this.buildNode('p', attrs, "All logs:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestErrorReport(thead, attrs, "log", tests);
        }
    }
    return text;
}

/**
 * Displays the report for multiple unit tests.
 *
 * @param json the test report.
 * @param showSummary a flag to display the summary.
 * @return the formatted report.
 */
function displayUnitGroup(json, showSummary) {
    var text = "";
    if (showSummary) {
        text += this.displaySummary(json);
    }

    var totaliser = json.summary;
    var attrs = { 'class': 'test unit' };
    var noAttrs = {};
    var headers = [ "Unit Test Name", "Tests", "Failures", "Errors", "Success Rate", "Time (ms)" ];
    var thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
    var rows = [];
    var tests = json.tests;
    var length = tests.length;
    var testSummary = null;
    var rate = null;
    var info = null;
    var i = null;
    for (i = 0; i < length; i += 1) {
        testSummary = tests[i];
        var summary = testSummary.summary;
        rate = summary.tests ? (100 * (summary.tests - summary.failures - summary.errors)) / summary.tests : 0.0;
        info = [
            testSummary.name, summary.tests.toString(), summary.failures.toString(),
            summary.errors.toString(), rate.toFixed(2) + "%", summary.time.toString()
        ];
        rows.push(this.buildNode('tr', noAttrs, this.buildRow('td', noAttrs, info).join('')));
    }
    text += this.buildNode('p', attrs, "Unit Tests Summary:");
    text += this.buildNode('table', attrs, [ thead, this.buildNode('tbody', noAttrs, rows.join('')) ].join(''));

    for (i = 0; i < length; i += 1) {
        text += this.displayUnitTest(tests[i], false);
    }

    if (showSummary && this.hasErrors(totaliser)) {
        headers = [ "Unit Test Name", "Function", "Message" ];
        if (totaliser.errors > 0) {
            attrs = { 'class': 'test errors' };
            text += this.buildNode('p', attrs, "All errors:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestsErrorReport(thead, attrs, 'error', tests);
        }
        if (totaliser.failures > 0) {
            attrs = { 'class': 'test failures' };
            text += this.buildNode('p', attrs, "All failures:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestsErrorReport(thead, attrs, 'fail', tests);
        }
        if (totaliser.logs > 0) {
            attrs = { 'class': 'test logs' };
            text += this.buildNode('p', attrs, "All logs:");
            thead = this.buildNode('thead', noAttrs, this.buildNode('tr', noAttrs, this.buildRow('th', noAttrs, headers).join('')));
            text += this.buildUnitTestsErrorReport(thead, attrs, 'log', tests);
        }
    }
    return text;
}