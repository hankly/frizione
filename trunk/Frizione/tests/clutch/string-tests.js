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
        // Prototype
        if (Object.toJSON && typeof Object.toJSON === 'function') {
            return Object.toJSON(object);
        }
        else {
            return JSON.stringify(object);
        }
    },

    fromJSON: function (string) {
        // Prototype
        if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
            return string.evalJSON(true);
        }
        else {
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
    },

    messagePack: function (message, arg) {
        if (arg === null || typeof arg === 'undefined') {
            return message;
        }
        if (arg instanceof String || typeof arg === 'string') {
            return message + " " + arg;
        }
        if (arg instanceof Array || typeof arg === 'object') {
            return message + '.json ' + clutch.string.toJSON(arg);
        }
        return message + " " + arg.toString();
    },

    messageUnpack: function (message) {
        var parts = message.match(/\s?(\S+)\s+(.+)/);
        if (parts === null || parts.length === 1) {
            return { message: message, arg: null };
        }
        var command = parts[1];
        if (this.endsWith(command, '.json')) {
            command = command.substring(0, command.length - 5);
            return { message: command, arg: clutch.string.fromJSON(parts[2]) };
        }
        return { message: command, arg: parts[2] };
    }
};
/*

*/

/*jslint evil: true */
/*global clutch, createStringTests, runClutchTests */

function createStringTests() {
    return clutch.unittest('String Tests', {

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
        },

        testMessagePack: function () {
            var cs = clutch.string;
            var message = cs.messagePack("hello");
            this.assert(message === 'hello', "clutch.string.messagePack()#1 failed");
            message = cs.messagePack("hello", "world");
            this.assert(message === 'hello world', "clutch.string.messagePack()#2 failed");
            message = cs.messagePack("hello", String("world"));
            this.assert(message === 'hello world', "clutch.string.messagePack()#3 failed");
            message = cs.messagePack("hello", 3);
            this.assert(message === 'hello 3', "clutch.string.messagePack()#4 failed");
            message = cs.messagePack("hello", true);
            this.assert(message === 'hello true', "clutch.string.messagePack()#5 failed");
            var ref = [ "world", 3, true ];
            message = cs.messagePack("hello", ref);
            this.assert(cs.startsWith(message, 'hello.json ['), "clutch.string.messagePack()#6 failed");
            this.assert(cs.endsWith(message, 'true]'), "clutch.string.messagePack()#7 failed");
        }
    });
}

function runClutchTests() {
    return createStringTests();
}
