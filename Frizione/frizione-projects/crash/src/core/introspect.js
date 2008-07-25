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

/*
Slightly modified from my article. This one works...
See http://www.syger.it/Tutorials/JavaScriptIntrospector.html
*/

/*jslint evil: false */
/*global crash */

if (!this.crash) {
    crash = {};
}

/**
 * Provides a little help to the standard typeof keyword. Just a little less brain-dead, but still pretty comatose.
 *
 * @param obj the object you want the type of.
 */
crash.typeOf = function (obj) {
    var type = typeof obj;
    return type === "object" && !obj ? "null" : type;
};

/**
 * Creates a string representation of an object.
 *
 * @param name the name of the object.
 * @param obj the object to introspect.
 * @param indent the optional start indentation, something like "  ", defaults to ""
 * @param levels optional, how many levels to drill down to, helps avoid recursion - default is 1.
 */
crash.introspect = function (name, obj, indent, levels) {
    indent = indent || "";
    if (crash.typeOf(levels) !== "number") {
        levels = 1;
    }
    var objType = crash.typeOf(obj);
    var result = [indent, name, " ", objType, " :"].join('');
    var prop = null;
    if (objType === "object") {
        if (levels > 0) {
            indent = indent + "  ";
            for (prop in obj) {
                result = [result, "\n", crash.introspect(prop, obj[prop], indent, levels - 1)].join('');
            }
            return result;
        }
        else {
            return result + " ...";
        }
    }
    else if (objType === "null") {
        return result + " null";
    }
    return [result, " ", obj].join('');
};