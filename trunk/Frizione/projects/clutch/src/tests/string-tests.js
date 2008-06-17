/*

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