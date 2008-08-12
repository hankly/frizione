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

/*jslint evil: true */
/*global crash, JSON */

/**
 * @requires JSON
 */

// Since JSON has no date format, everyone has invented their own. So why not me?
// Provides patches for JSON and Prototype, but please don't use them both together, they
// really don't get on at all.
crash.date = {
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

    toCrashJSON: function () {
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
            var microsoftDate = /^\\\/Date\((\d+)\)\\\/$/gm;
            var crashDate = /^\\\/Date\((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?Z\)\\\/$/gm;

            String.prototype.evalJSON = function(sanitize) {
              var json = this.unfilterJSON();
              try {
                if (!sanitize || json.isJSON()) {
                    json = json.replace(microsoftDate, function (str, p1, offset, s) {
                        return "new Date(" + p1 + ")";
                    });
                    json = json.replace(crashDate, function (str, p1, p2, p3, p4, p5, p6, p7, offset, s) {
                        var millis = p7 || ".0";
                        millis = millis.slice(1);
                        return "new Date(Date.UTC(" + (+p1) + ", " + (+p2 - 1) + ", " + (+p3) + ", " + (+p4) + ", " + (+p5) + ", " + (+p6) + ", " + (+millis) + "))";
                    });
                    return new Function('return (' + json + ');')();
                }
              } catch (e) { /* ignore the exception */ }
              throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
            };
        }
    }
};

// The usual, boring string functions that the implementers forgot.
String.prototype.trim = function () {
    return this.replace(/^[\s\u00a0]+/, '').replace(/[\s\u00a0]+$/, '');
};

String.prototype.startsWith = function (match) {
    return this.indexOf(match) === 0;
};

String.prototype.endsWith = function (match) {
    var offset = this.length - match.length;
    return offset >= 0 && this.lastIndexOf(match) === offset;
};

String.prototype.toJSON = function (object) {
    // Check for Prototype
    if (Object.toJSON && typeof Object.toJSON === 'function') {
        return Object.toJSON(object);
    }
    else {
        return JSON.stringify(object);
    }
};

String.prototype.fromJSON = function (string) {
    // Check for Prototype
    if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
        return string.evalJSON(true);
    }
    else {
        var microsoftDate = /^\\\/Date\((\d+)\)\\\/$/gm;
        var crashDate = /^\\\/Date\((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?Z\)\\\/$/gm;

        return JSON.parse(string, function (key, value) {
            var match, millis;
            if (typeof value === 'string') {
                match = microsoftDate.exec(value);
                if (match) {
                    return new Date(+match[1]);
                }
                else {
                    match = crashDate.exec(value);
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
};