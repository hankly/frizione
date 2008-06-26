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
    if (this.window) {
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

if (!this.clutch.timer) {
    clutch.timer = {};
}

// Creates timer functions using either the browser timer or a Gears timer when no browser timer is available.

(function () {
    var gearsTimer = null;

    // don't try to simplify this stuff, clutch.timer.setTimeout = window.setTimeout causes all sorts of problems
    // with Opera and Firefox (which actually crashes)
    if (this.window && window.setTimeout) {
        clutch.timer.setTimeout = function (code, millis) {
            return window.setTimeout(code, millis);
        };
        clutch.timer.setInterval = function (code, millis) {
            return window.setInterval(code, millis);
        };
        clutch.timer.clearTimeout = function (timerId) {
            window.clearTimeout(timerId);
        };
    }
    else {
        gearsTimer = clutch.createGearsTimer();
        clutch.timer.setTimeout = function (code, millis) {
            return gearsTimer.setTimeout(code, millis);
        };
        clutch.timer.setInterval = function (code, millis) {
            return gearsTimer.setInterval(code, millis);
        };
        clutch.timer.clearTimeout = function (timerId) {
            gearsTimer.clearTimeout(timerId);
        };
    }
})();
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
/*global clutch, google, $, $A */

// Simple WorkerPool termination check functions.
// I don't see any advantage in producing a generic library for these simple functions.

/**
 * Start the WorkerPool.
 */
function startWorkerPool() {
    var messageId = 1;
    var worker = null;
    var workerId = null;
    var linkSet = false;

    function sendMessage() {
        worker.sendMessage("Main message #" + messageId + " to " + workerId, workerId);
        messageId += 1;
    }

    function actOnMessage(depr1, depr2, message) {
        if (message.sender === workerId) {
            if (!linkSet) {
                $('external-link').replace("<p id = 'external-link'><code>WorkerPool</code> now running. " +
                                           "Let it run for a few seconds, then click on this " +
                                           "<a href='http://www.syger.it/'>link</a> " +
                                           "and then come back to this page.</p>");
                linkSet = true;
            }
            clutch.timer.setTimeout(sendMessage, 250);
        }
    }

    worker = clutch.createGearsWorkerPool();
    worker.onmessage = actOnMessage;
    workerId = worker.createWorkerFromUrl('/projects/clutch-gears/tests/wp-logger.js?nocache=' + new Date().getTime());
    sendMessage();
}

/**
 * Give visual feedback for WorkerPool termination.
 */
function checkWorkerPoolTermination() {

    function showDatabase() {
        var logger = clutch.db.logger('clutch_gears');
        var params = { orderBy: 'id DESC', limit: 20 };
        var rows = $A(logger.list(params));
        var result = [];
        rows.each(function (row) {
            result.push("<tr><td>" + row.id + "</td><td>" + row.name + "</td><td>" + row.value + "</td></tr>");
        });
        result = "<table id='db-results'>" +
                        "<thead><tr><th>Id</th><th>Name</th><th>Value</th></tr></thead>" +
                        "<tbody>" + result.join('') + "</tbody>" +
                     "</table>";
        $('db-results').replace("<div align='center'>" + result + "</div>");
        $('start-wp').replace("<p id='start-up'>" +
                              "Please <a href='javascript:void(0);' onclick='startWorkerPool(); return true;'>start</a> " +
                              "the <code>WorkerPool</code>.</p>");
        logger.removeAll();
    }

    document.observe('dom:loaded', function() {
        showDatabase();
    });
}
