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

/*global crash, createStringTests, runCrashTests */

function createStringTests() {

    return crash.test.unit('String Tests', {

        testTrim: function () {
            var result = " \n\t\u00a0trimmed \n\t\u00a0".trim();
            this.assert(result === "trimmed", "trim()#1 failed \"" + result + "\"");
            result = " \n\t\u00a0still \n\t\u00a0trimmed \n\t\u00a0".trim();
            this.assert(result === "still \n\t\u00a0trimmed", "trim()#2 failed \"" + result + "\"");
         },

        testStartsWith: function () {
            var text = "startsWith";
            this.assert(text.startsWith("start"), "startsWith()#1 failed");
            this.assert(text.startsWith("end") === false, "startsWith()#2 failed");
            this.assert(text.startsWith(""), "startsWith()#3 failed");
            this.assert(text.startsWith("startsWithEndsWith") === false, "startsWith()#4 failed");
        },

        testEndsWith: function () {
            var text = "endsWith";
            this.assert(text.endsWith("With"), "endsWith()#1 failed");
            this.assert(text.endsWith("with") === false, "endsWith()#2 failed");
            this.assert(text.endsWith(""), "endsWith()#3 failed");
            this.assert(text.endsWith("startsWithEndsWith") === false, "endsWith()#4 failed");
        },

        testJsonObject: function () {
            var object = {
                a: "hello",
                b: true,
                c: 3.1,
                d: new Date(2008, 5, 25, 22, 30, 1, 123)
            };

            crash.date.toCrashJSON();
            if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
                crash.date.evalJSON();
            }
            var resultJSON = "".toJSON(object);
            var objectCopy = "".fromJSON(resultJSON);
            this.assert(object.a === objectCopy.a, "to/fromJSON object string failed");
            this.assert(object.b === objectCopy.b, "to/fromJSON object boolean failed");
            this.assert(object.c === objectCopy.c, "to/fromJSON object numeric failed");
            this.assert(object.d.getTime() === objectCopy.d.getTime(), "to/fromJSON object Date failed");
        },

        testJsonArray: function () {
            var array = [
                "hello",
                true,
                3.1,
                new Date(2008, 5, 25, 22, 30, 1, 123)
            ];

            crash.date.toCrashJSON();
            if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
                crash.date.evalJSON();
            }
            var resultJSON = "".toJSON(array);
            var arrayCopy = "".fromJSON(resultJSON);
            this.assert(array[0] === arrayCopy[0], "to/fromJSON array string failed");
            this.assert(array[1] === arrayCopy[1], "to/fromJSON array boolean failed");
            this.assert(array[2] === arrayCopy[2], "to/fromJSON array numeric failed");
            this.assert(array[3].getTime() === arrayCopy[3].getTime(), "to/fromJSON array Date failed");
        }
    }, 1000);
}

function runCrashTests() {
    return createStringTests();
}