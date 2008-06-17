/*

*/

/*

 */

/*jslint evil: true */
/*global clutch, JSON */

if (!this.clutch) {
    clutch = {};
}

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
        if (Object.toJSON && typeof Object.toJSON === 'function') {
            return Object.toJSON(object);
        }
        else {
            return JSON.stringify(object);
        }
    },

    fromJSON: function (string) {
        if (String.prototype.evalJSON && typeof String.prototype.evalJSON === 'function') {
            return string.evalJSON(true);
        }
        else {
            return JSON.parse(string);
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
/*global clutch, createUnitTests, runClutchTests */

function createUnitTests() {
    return clutch.unittest('Assertion Tests', {

        testPass: function () {
            this.pass();
            this.assert(true === true);
        },

        testFail: function () {
            this.fail("Test fail() call");
            this.assert(true === false, "assert(false) guaranteed to fail");
        },

        testError: function () {
            this.error(new Error("Test error() call"));
        },

        testAssert: function () {
            this.assert(true === true, "assert(true) shouldn't fail");
        }
    });
}

function runClutchTests() {
    return createUnitTests();
}
