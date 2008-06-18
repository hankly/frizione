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