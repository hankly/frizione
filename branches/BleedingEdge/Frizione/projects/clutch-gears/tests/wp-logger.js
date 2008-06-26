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
/*global clutch, JSON */

if (!this.clutch) {
    clutch = {};
}

// Since JSON has no date format, everyone has invented their own. So why not me?
// Provides patches for JSON and Prototype, but please don't use them both together, they
// really don't get on at all.
clutch.date = {
    toStandardJSON: function () {
        function tens(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function hundreds(n) {
            // Format integers to have at least three digits.
            return n < 100 ? '0' + tens(n) : n;
        }

        Date.prototype.toJSON = function () {

            return this.getUTCFullYear()  + '-' +
                 tens(this.getUTCMonth() + 1) + '-' +
                 tens(this.getUTCDate())  + 'T' +
                 tens(this.getUTCHours()) + ':' +
                 tens(this.getUTCMinutes()) + ':' +
                 tens(this.getUTCSeconds()) + '.' +
                 hundreds(this.getUTCMilliseconds()) + 'Z';
        };
    },

    toMicrosoftJSON: function () {
        Date.prototype.toJSON = function () {
            return "\\/Date(" + this.getTime() + ")\\/";
        };
    },

    toClutchJSON: function () {
        function tens(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function hundreds(n) {
            // Format integers to have at least three digits.
            return n < 100 ? '0' + tens(n) : n;
        }

        Date.prototype.toJSON = function () {
            return "\\/Date(" +
                 this.getUTCFullYear()  + '-' +
                 tens(this.getUTCMonth() + 1) + '-' +
                 tens(this.getUTCDate())  + 'T' +
                 tens(this.getUTCHours()) + ':' +
                 tens(this.getUTCMinutes()) + ':' +
                 tens(this.getUTCSeconds()) + '.' +
                 hundreds(this.getUTCMilliseconds()) + 'Z' +
                 ")\\/";
        };
    },

    evalJSON: function () {
        // Prototype
        if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
            var microsoftDate = new RegExp("^\\\\\\/Date\\((\\d+)\\)\\\\\\/$", "gm");
            var clutchDate = new RegExp("^\\\\\\/Date\\((\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(\\.\\d+)?Z\\)\\\\\\/$", "gm");

            String.prototype.evalJSON = function(sanitize) {
              var json = this.unfilterJSON();
              try {
                if (!sanitize || json.isJSON()) {
                    json = json.replace(microsoftDate, function (str, p1, offset, s) {
                        return "new Date(" + p1 + ")";
                    });
                    json = json.replace(clutchDate, function (str, p1, p2, p3, p4, p5, p6, p7, offset, s) {
                        var millis = p7 || ".0";
                        millis = millis.slice(1);
                        return "new Date(Date.UTC(" + (+p1) + ", " + (+p2 - 1) + ", " + (+p3) + ", " + (+p4) + ", " + (+p5) + ", " + (+p6) + ", " + (+millis) + "))";
                    });
                    return new Function('return (' + json + ');')();
                }
              } catch (e) { }
              throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
            };
        }
    }
};

// The usual, boring string functions that the implementers forgot.
clutch.string = {
    trim: function (string) {
        return string.replace(/^[\s\u00a0]+/, '').replace(/[\s\u00a0]+$/, '');
    },

    startsWith: function (string, match) {
        return string.indexOf(match) === 0;
    },

    endsWith: function (string, match) {
        var offset = string.length - match.length;
        return offset >= 0 && string.lastIndexOf(match) === offset;
    },

    toJSON: function (object) {
        // Check for Prototype
        if (Object.toJSON && typeof Object.toJSON === 'function') {
            return Object.toJSON(object);
        }
        else {
            return JSON.stringify(object);
        }
    },

    fromJSON: function (string) {
        // Check for Prototype
        if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
            return string.evalJSON(true);
        }
        else {
            // string RegExps used to keep Opera happy, but made me miserable
            var microsoftDate = new RegExp("^\\\\\\/Date\\((\\d+)\\)\\\\\\/$", "gm");
            var clutchDate = new RegExp("^\\\\\\/Date\\((\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(\\.\\d+)?Z\\)\\\\\\/$", "gm");

            return JSON.parse(string, function (key, value) {
                var match, millis;
                if (typeof value === 'string') {
                    match = microsoftDate.exec(value);
                    if (match) {
                        return new Date(+match[1]);
                    }
                    else {
                        match = clutchDate.exec(value);
                        if (match) {
                            millis = match[7] || ".0";
                            millis = match[7].slice(1);
                            return new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6], +millis));
                        }
                    }
                }
                return value;
            });
        }
    }
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
/*global clutch, google */

// Simple WorkerPool termination functions.
// I don't see any advantage in producing a generic library for these simple functions.

if (!this.clutch) {
    clutch = {};
}

/**
 * Logs received messages, errors and timer intervals.
 */
(function () {
    var wp = google.gears.workerPool;
    var logger = clutch.db.logger('clutch_gears');

    function actOnTimer() {
        logger.log("timer", new Date().toJSON());
    }

    function actOnMessage(depr1, depr2, message) {
        logger.log("message", new Date().toJSON() + " " + message.body);
        wp.sendMessage("Message logged", message.sender);
    }

    function actOnError(error) {
        logger.log("error", new Date().toJSON() + " Error(" + error.lineNumber + '): ' + error.message);
        return false;
    }

    function timeConsumer() {
        logger.log("start long process", new Date().toJSON());

        var number = 1;
        var maxNumber = 8000;
        var primeFlag = true;
        var maxTest = 0;
        var test = 0;
        for (number = 1; number <= maxNumber; number += 1) {
            primeFlag = true;
            maxTest = number / 2;
            if (( number !== 2 ) && (( number % 2) === 0)) {
                primeFlag = false;
            }
            test = 3;
            while ((test <= maxTest) && (primeFlag)) {
                if ((number % test) === 0) {
                    primeFlag = false;
                }
                test = test + 2;
            }
        }

        logger.log("end long process", new Date().toJSON());
        clutch.timer.setTimeout(timeConsumer, 10);
    }

    clutch.date.toStandardJSON();
    wp.onmessage = actOnMessage;
    wp.onerror = actOnError;
    clutch.timer.setInterval(actOnTimer, 500);
    clutch.timer.setTimeout(timeConsumer, 10);
})();
