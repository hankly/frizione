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
            { func: 'readRowsDesc', callbacks: null }
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
            var length = 10;
            var rowsAffected = null;
            for (index = 1; index <= length; index += 1) {
                rowsAffected = logger.log("log", "test value = " + index);
                this.assert(rowsAffected === 1, "Rows affected by log() !== 1");
            }
        },

        readRowsAsc: function () {
            var results = logger.list({ orderBy: 'id ASC' });
            this.assert(results.length === 10, "Show have read 10 rows");
            var index = 1;
            var length = 10;
            var result = null;
            for (index = 1; index <= length; index += 1) {
                result = results[index - 1];
                this.assert(result.value === ("test value = " + index),
                        "Row[" + index + "].value should have been 'test value = " + index +
                        "', but was '" + result.value + "'");
            }
        },

        readRowsDesc: function () {
            var results = logger.list({ orderBy: 'id DESC' });
            this.assert(results.length === 10, "Show have read 10 rows");
            var index = 10;
            var result = null;
            for (index = 10; index >= 1; index -= 1) {
                result = results[10 - index];
                this.assert(result.value === ("test value = " + index),
                        "Row[" + (11 - index) + "].value should have been 'test value = " + index +
                        "', but was '" + result.value + "'");
            }
        }
    }, 5000);
}

function runClutchTests() {
    return createDatabaseTests();
}