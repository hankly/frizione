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

/*jslint evil: false */
/*global clutch, runClutchTests */

/*test to: /js/test/all-wp.js
     json: /js/test/all-wp.test.json
     type: workerpool */
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

/*jslint evil: false */
/*global clutch, google */

// Just wrapper code, so that if 'beta.xxx' becomes 'gamma.xxx', or the namespace changes (is that really likely?)
// I won't have to hunt around in a lot of JavaScript files...

if (!this.clutch) {
    clutch = {};
}

clutch.isGearsInstalled = function () {
    return (function () {
        if (!!this.window) {
            return window.google && google && google.gears;
        }
        else {
            return google && google.gears;
        }
    })();
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

/*jslint evil: false */
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
    if (!!this.window && !!this.window.setTimeout) {
        clutch.timer.setTimeout = function (code, millis) {
            return window.setTimeout(code, millis);
        };
        clutch.timer.setInterval = function (code, millis) {
            return window.setInterval(code, millis);
        };
        clutch.timer.clearTimeout = function (timerId) {
            window.clearTimeout(timerId);
        };
        clutch.timer.clearInterval = function (timerId) {
            window.clearInterval(timerId);
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
        clutch.timer.clearInterval = function (timerId) {
            gearsTimer.clearInterval(timerId);
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

/*
Inspired by Aaron Boodman's Worker2 micro project
See http://groups.google.com/group/gears-users/browse_thread/thread/62a021c62828b8e4/67f494497639b641
*/

/*jslint evil: false */
/*global clutch, google, ActiveXObject */

if (!this.clutch) {
    clutch = {};
}

if (!this.clutch.xhr) {
    clutch.xhr = {};
}

/**
 * Creates an XHR object.
 */
clutch.xhr.createRequest = function () {
    try {
        return clutch.createGearsHttpRequest();
    }
    catch (e) {
        try {
            return new XMLHttpRequest();
        }
        catch (e1) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e2) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (e3) {
                    // poo
                }
            }
        }
    }
    return null;
};

/**
 * Executes an XHR.
 *
 * @param method can be "GET", possibly "POST".
 * @param url the absolute URL to get or post to.
 * @param optionalParams optional parameters, do your own value encoding though
 * @param optionalBody damn useful for posts
 * @param timeout the optional maximum amount of time to wait for a reply.
 * @param handler who to call when things go right, or wrong.
 */
clutch.xhr.executeRequest = function (method, url, optionalParams, optionalBody, timeout, handler) {
    var requestTimeout = timeout || 5000; // 5 seconds

    var request = clutch.xhr.createRequest();
    var terminated = false;
    var timerId = clutch.timer.setTimeout(function () {
            terminated = true;
            if (request) {
                request.abort();
                request = null;
            }
            handler(-1, "Timeout", "");
        }, requestTimeout);
    var param;
    var qmark = "?";

    if (optionalParams) {
        for (param in optionalParams) {
            if (optionalParams.hasOwnProperty(param)) {
                url += qmark + param + "=" + optionalParams[param];
                qmark = "";
            }
        }
    }

    try {
        request.onreadystatechange = function() {
            // IE fires onreadystatechange when you abort. Check to make sure we're
            // not in this situation before proceeding.
            if (terminated) {
                return;
            }

            try {
                if (request.readyState === 4) {
                    var status, statusText, responseText;

                    try {
                        status = request.status;
                        statusText = request.statusText;
                        responseText = request.responseText;
                    }
                    catch (e1) {
                        // We cannot get properties while the window is closing.
                    }

                    terminated = true;
                    request = null;
                    clutch.timer.clearTimeout(timerId);

                    // Browsers return 0 for xhr against file://. Normalize this.
                    if (status === 0) {
                        status = 200;
                    }

                    handler(status, statusText, responseText);
                }
            }
            catch (e2) {
                throw e2;
            }
        };

        // Firefox throws on open() when it is offline; IE throws on send().
        request.open(method, url, true /* async */);
        request.send(optionalBody || null);

        return function () {
            if (request) {
                terminated = true;
                request.abort();
                request = null;
                clutch.timer.clearTimeout(timerId);
            }
            handler(-1, "Aborted", "Aborted");
        };
    }
    catch(e) {
        terminated = true;
        request = null;
        clutch.timer.clearTimeout(timerId);

        // Set a short timeout just to get off the stack so that the call flow is
        // the same as with successful requests (subtle bugs otherwise).
        clutch.timer.setTimeout(handler, 0);

        // Return a nop function so that callers don't need to care whether we
        // succeeded if they want to abort the previous request.
        return function () {};
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

/*jslint evil: false */
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
clutch.db.fromRow = function (result, columns) {
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

/*jslint evil: false */
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
            return clutch.db.fromRow(result, columns);
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
    http://www.JSON.org/json2.js
    2008-05-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects without a toJSON
                        method. It can be a function or an array.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array, then it will be used to
            select the members to be serialized. It filters the results such
            that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", call,
    charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
    getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, length,
    parse, propertyIsEnumerable, prototype, push, replace, slice, stringify,
    test, toJSON, toString
*/

if (!this.JSON) {

// Create a JSON object only if one does not already exist. We create the
// object in a closure to avoid creating global variables.

    JSON = function () {

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

//      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
//          escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        var cx = new RegExp("[\\u0000\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]", "g"),
            escapeable = new RegExp("[\\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]", "g"),
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            escapeable.lastIndex = 0;
            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// If the object has a dontEnum length property, we'll treat it as an array.

                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                                partial.join(',\n' + gap) + '\n' +
                                    mind + ']' :
                              '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value, rep);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value, rep);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                            mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

// Return the JSON object containing the stringify and parse methods.

        return {
            stringify: function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

// If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

                return str('', {'': value});
            },


            parse: function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' +
                                (+(a.charCodeAt(0))).toString(16)).slice(-4);
                    });
                }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

//                  j = eval('(' + text + ')');
                    j = new Function('return (' + text + ');')();

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            }
        };
    }();
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

/*jslint evil: false */
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

    var assertions = {

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

    (function () {
        // don't try to simplify this stuff, setTestTimeout = window.setTimeout causes all sorts of problems
         // with Opera and Firefox (which actually crashes)
        if (!!this.window && !!this.window.setTimeout) {
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
    })();

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

/*jslint evil: false */
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

/*jslint evil: false */
/*global clutch, google, runClutchTests */

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

/*jslint evil: false */
/*global clutch, createStringTests, runClutchTests */

function createStringTests() {

    return clutch.test.unit('String Tests', {

        testTrim: function () {
            var cs = clutch.string;
            var result = cs.trim(" \n\t\u00a0trimmed \n\t\u00a0");
            this.assert(result === "trimmed", "clutch.string.trim()#1 failed \"" + result + "\"");
            result = cs.trim(" \n\t\u00a0still \n\t\u00a0trimmed \n\t\u00a0");
            this.assert(result === "still \n\t\u00a0trimmed", "clutch.string.trim()#2 failed \"" + result + "\"");
         },

        testStartsWith: function () {
            var cs = clutch.string;
            var text = "startsWith";
            var result = cs.startsWith(text, "start");
            this.assert(result, "clutch.string.startsWith()#1 failed");
            result = cs.startsWith(text, "end");
            this.assert(result === false, "clutch.string.startsWith()#2 failed");
            result = cs.startsWith(text, "");
            this.assert(result, "clutch.string.startsWith()#3 failed");
            result = cs.startsWith(text, "startsWithEndsWith");
            this.assert(result === false, "clutch.string.startsWith()#4 failed");
        },

        testEndsWith: function () {
            var cs = clutch.string;
            var text = "endsWith";
            var result = cs.endsWith(text, "With");
            this.assert(result, "clutch.string.endsWith()#1 failed");
            result = cs.endsWith(text, "with");
            this.assert(result === false, "clutch.string.endsWith()#2 failed");
            result = cs.endsWith(text, "");
            this.assert(result, "clutch.string.endsWith()#3 failed");
            result = cs.endsWith(text, "startsWithEndsWith");
            this.assert(result === false, "clutch.string.endsWith()#4 failed");
        },

        testJsonObject: function () {
            var cs = clutch.string;
            var object = {
                a: "hello",
                b: true,
                c: 3.1,
                d: new Date(2008, 5, 25, 22, 30, 1, 123)
            };

            clutch.date.toClutchJSON();
            if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
                clutch.date.evalJSON();
            }
            var resultJSON = cs.toJSON(object);
            var objectCopy = cs.fromJSON(resultJSON);
            this.assert(object.a === objectCopy.a, "clutch.string.to/fromJSON object string failed");
            this.assert(object.b === objectCopy.b, "clutch.string.to/fromJSON object boolean failed");
            this.assert(object.c === objectCopy.c, "clutch.string.to/fromJSON object numeric failed");
            this.assert(object.d.getTime() === objectCopy.d.getTime(), "clutch.string.to/fromJSON object Date failed");
        },

        testJsonArray: function () {
            var cs = clutch.string;
            var array = [
                "hello",
                true,
                3.1,
                new Date(2008, 5, 25, 22, 30, 1, 123)
            ];

            clutch.date.toClutchJSON();
            if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
                clutch.date.evalJSON();
            }
            var resultJSON = cs.toJSON(array);
            var arrayCopy = cs.fromJSON(resultJSON);
            this.assert(array[0] === arrayCopy[0], "clutch.string.to/fromJSON array string failed");
            this.assert(array[1] === arrayCopy[1], "clutch.string.to/fromJSON array boolean failed");
            this.assert(array[2] === arrayCopy[2], "clutch.string.to/fromJSON array numeric failed");
            this.assert(array[3].getTime() === arrayCopy[3].getTime(), "clutch.string.to/fromJSON array Date failed");
        }
    }, 1000);
}

function runClutchTests() {
    return createStringTests();
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

/*jslint evil: false */
/*global clutch, createUnitTests, runClutchTests */

function createUnitTests() {

    return clutch.test.unit('Assertion Tests', {

        clutchTests: [
            { func: 'logTest', callbacks: null },
            { func: 'passTest', callbacks: null },
            { func: 'failTest', callbacks: null },
            { func: 'errorTest', callbacks: null },
            { func: 'assertTest', callbacks: null }
        ],

        logTest: function () {
            this.log("Test log message");
            this.assert(true === true);
        },

        passTest: function () {
            this.pass();
            this.assert(true === true);
        },

        failTest: function () {
            this.fail("Test fail() call");
            this.assert(true === false, "assert(false) guaranteed to fail");
        },

        errorTest: function () {
            throw new Error("Test error() call");
        },

        assertTest: function () {
            this.assert(true === true, "assert(true) shouldn't fail");
        }
    }, 1000);
}

function runClutchTests() {
    return createUnitTests();
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

/*jslint evil: false */
/*global clutch, google */

function createTimerTests() {

    return clutch.test.unit('Timer Tests', {

        clutchTests: [
            { func: 'startSetTimeout', callbacks: [ 'timerSetTimeout' ] },
            { func: 'startSetInterval', callbacks: [ 'timerSetInterval' ] }
        ],

        timerId: null,
        timerStart: null,

        startSetTimeout: function () {
            this.timerId = clutch.timer.setTimeout(this.timerSetTimeout, 250);
            this.timerStart = new Date().getTime();
            this.assert(this.timerId !== null, "Timer Id is null");
        },

        timerSetTimeout: function () {
            clutch.timer.clearTimeout(this.timerId);
            var time = new Date().getTime() - this.timerStart;
            // be generous, timers aren't very precise
            this.assert(time >= (250 - 25), "Time <= 250 ms (" + time + ")");
        },

        startSetInterval: function () {
            this.timerId = clutch.timer.setInterval(this.timerSetInterval, 250);
            this.timerStart = new Date().getTime();
            this.assert(this.timerId !== null, "Timer Id is null");
        },

        timerSetInterval: function () {
            clutch.timer.clearTimeout(this.timerId);
            var time = new Date().getTime() - this.timerStart;
            // be generous, timers aren't very precise
            this.assert(time >= (250 - 25), "Time <= 250 ms (" + time + ")");
        }
    }, 1000);
}

function runClutchTests() {
    return createTimerTests();
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

/*jslint evil: false */
/*global clutch, google, createXhrTests, runXhrTests */

function createXhrTests() {

    return clutch.test.unit('XHR Tests', {

        clutchTests: [
            { func: 'validUrl', callbacks: [ 'validUrlHandler' ] },
            { func: 'invalidUrl', callbacks: [ 'invalidUrlHandler' ] },
            { func: 'abortedRequest', callbacks: [ 'abortedRequestHandler' ] }
        ],

        validUrl: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/projects/clutch/readfixture/js/dev-test/gears/xhr-test-data.json',
                    null, null, 2000, this.validUrlHandler);
            this.checkAbort(abort);
        },

        validUrlHandler: function (status, statusText, responseText) {
            this.assert(status >= 200 && status <= 299, "Status not between 200 and 299: " + status + ", " + statusText);
        },

        invalidUrl: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/projects/clutch/readfixture/invalid-url.json',
                    null, null, 2000, this.invalidUrlHandler);
            this.checkAbort(abort);
        },

        invalidUrlHandler: function (status, statusText, responseText) {
            this.assert(status >= 400 && status <= 499, "Status not between 400 and 499: " + status + ", " + statusText);
        },

        abortedRequest: function () {
            var abort = clutch.xhr.executeRequest("GET", '/frizione/projects/clutch/readfixture/invalid-url.json',
                    null, null, 2000, this.abortedRequestHandler);
            this.checkAbort(abort);
            abort();
        },

        abortedRequestHandler: function (status, statusText, responseText) {
            this.assert(status === -1, "Status not -1");
            this.assert(statusText === 'Aborted', "Status text not 'Aborted'");
            this.assert(responseText === 'Aborted', "Response text not 'Aborted'");
        },

        checkAbort: function (abort) {
            this.assert(abort !== null, "Returned value is null");
            this.assert(typeof abort === 'function', "Returned value is not a function");
        }
        
    }, 6500);
}

function runClutchTests() {
    return createXhrTests();
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

/*jslint evil: false */
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

function runClutchTests() {
    return clutch.test.group([
            createUnitTests(),
            createStringTests(),
            createTimerTests(),
            createXhrTests(),
            createDatabaseTests()
        ], 12000);
}