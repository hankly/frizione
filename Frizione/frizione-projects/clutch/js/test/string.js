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

/*test to: /js/test/string.js
     json: /js/test/string.test.json */
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