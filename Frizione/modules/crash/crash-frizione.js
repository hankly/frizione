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

/*join to: /distro/crash-frizione.js */
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
Inspired by Michael Mathew's IO.include
http://code.google.com/p/jsdoc-toolkit/
 */

/*globals crash, java, app */

if (!this.crash) {
    crash = {};
}

(function () {

    // for documentation, see core/loader.js

    crash.root = app.getServerDir();

    crash.include = function (rel) {
        if (rel.charAt(0) === '/') {
            rel = rel.substring(1);
        }
        var file = new java.io.File(crash.root + '/' + rel).getAbsoluteFile();
        if (file.isFile()) {
            app.addRepository(rel);
        }
        else {
            var fileList = file.list();
            var length = 0;
            var i = 0;
            var next = null;
            if (fileList) {
                length = fileList.length;
                if (rel.charAt(rel.length - 1) !== '/') {
                    rel += '/';
                }
                for (i = 0; i < length; i += 1) {
                    next = fileList[i];
                    if (new java.io.File(file, next).isFile()) {
                        app.addRepository(rel + next);
                    }
                }
            }
        }
    };
})();

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
/*globals crash, java */

if (!this.crash) {
    crash = {};
}

/**
 * File manipulation functions.
 *
 * @param {String} path the file path.
 */
crash.file = function (path) {

    var result = {

        file: new java.io.File(path).getAbsoluteFile(),

        /**
         * Tests whether the file or directory exists.
         *
         * @return {Boolean} true if the file or directory exists, otherwise false.
         */
        exists: function () {
            return result.file.exists();
        },

        /**
         * Checks if the file is a directory.
         *
         * @return {Boolean} true if exists and is a directory, otherwise false.
         */
        isDirectory: function () {
            return result.file.isDirectory();
        },

        /**
         * Checks if the file is a normal file.
         *
         * @return (Boolean) true if exists and is a normal file, otherwise false.
         */
        isFile: function () {
            return result.file.isFile();
        },

        /**
         * Checks if the file can be read.
         *
         * @return {Boolean} true if the file exists and can be read, otherwise false.
         */
        canRead: function () {
            return result.file.canRead();
        },

        /**
         * Checks if the file can be written.
         *
         * @return {Boolean} true if the file exists and can be written, otherwise false.
         */
        canWrite: function () {
            return result.file.canWrite();
        },

        /**
         * Gets the file size in bytes.
         *
         * @return {Number} the size in bytes, or 0L if the file does not exist.
         */
        size: function () {
            return result.file.length();
        },

        /**
         * Returns the pathname string of this file's parent.
         *
         * @return {String} the parent, or null if no parent present.
         */
        parent: function () {
            return result.file.getParent();
        },

        /**
         * Gets the path part of this file.
         *
         * @return {String} the file path part.
         */
        path: function () {
            return result.file.getPath();
        },

        /**
         * Gets the name part of this file.
         *
         * @return {String} the name path part.
         */
        name: function () {
            return result.file.getName();
        },

        /**
         * Returns the time when the file was last modified.
         *
         * @return {Number} the last modified time in milliseconds since 00:00:00 GMT, January 1, 1970.
         */
        lastModified: function () {
            return result.file.lastModified();
        },

        /**
         * Lists the files and directories.
         *
         * @param {Function} receiver the function that receives each file or directory.
         */
        each: function (receiver) {
            var fileList = result.file.listFiles();
            var length = 0;
            var i = 0;
            var next = null;
            var name = null;
            if (fileList) {
                length = fileList.length;
                for (i = 0; i < length; i += 1) {
                    next = fileList[i];
                    name = next.name;
                    if (next.isDirectory()) {
                        if (name !== "." && name !== "..") {
                            receiver(next);
                        }
                    }
                    else {
                        receiver(next);
                    }
                }
            }
        },

        /**
         * Creates the directory structure, including any necessary but nonexistent parent directories.
         *
         * @return {Boolean} true if the directory was created, otherwise false.
         */
        mkdirs: function () {
            return (result.file.exists() || result.file.mkdirs());
        },

        /**
         * Reads the entire binary contents of the file.
         *
         * @return {Byte[]} the contents as a byte array, or null if the file doesn't exist.
         */
        readBinary: function () {
            if (result.file.isFile() && result.file.exists()) {

                // See: http://www.mozilla.org/rhino/ScriptingJava.html
                var stream = new java.io.FileInputStream(result.file);
                var length = result.file.length();
                var binaryBuffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length);
                var offset = 0;
                while (offset < binaryBuffer.length) {
                    var numRead = stream.read(binaryBuffer, offset, binaryBuffer.length - offset);
                    if (numRead < 0) {
                        break;
                    }
                    offset += numRead;
                }
                stream.close();
                stream = null;
                return binaryBuffer;
            }
            return null;
        },

        /**
         * Reads the entire text contents of the file.
         *
         * @param {String} charset the character set to use (defaults to "UTF-8").
         * @return {String} the contents of the text file, or null if the file doesn't exist.
         */
        readText: function (charset) {
            if (result.file.isFile() && result.file.exists()) {

                var reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(result.file),
                        charset || "UTF-8"));
                var lines = [];
                while (true) {
                    var line = reader.readLine();
                    if (line === null) {
                        break;
                    }
                    lines.push(line);
                }
                reader.close();
                return lines.join('\n');
            }
            return null;
        },

        /**
         * Writes the entire contents of a text file.
         *
         * @param {String} data the file contents.
         * @param {String} charset the character set to use (defaults to "UTF-8").
         */
        writeText: function (data, charset) {
            var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(result.file),
                    charset || "UTF-8"));
            writer.write(data);
            writer.close();
            writer = null;
        },

        /**
         * Renames the file.
         *
         * @param {String} name the name of the new file.
         * @return {Boolean} true if the renaming succeeded, otherwise false.
         */
        renameTo: function (name) {
            var to = new java.io.File(name).getAbsolutePath();
            var renamed = result.file.renameTo(to);
            if (renamed) {
                result.file = new java.io.File(name).getAbsoluteFile();
            }
            return renamed;
        },

        /**
         * Makes a copy of the file.
         *
         * @param {String} dest the file to be copied to.
         * @return {Boolean} true if the copy succeeded, otherwise false.
         */
        copy: function (dest) {
            // See: http://www.mozilla.org/rhino/ScriptingJava.html
            var from = new java.io.BufferedInputStream(new java.io.FileInputStream(result.file));
            var to = new java.io.BufferedOutputStream(new java.io.FileOutputStream(dest));
            var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
            var bytesRead = 0;

            try {
                while ((bytesRead = from.read(buffer, 0, buffer.length)) > -1) {
                    to.write(buffer, 0, bytesRead);
                }
            }
            catch (e) {
                return false;
            }
            finally {
                from.close();
                to.close();
            }
            return true;
        },

        /**
         * Moves a file to a new destination.
         *
         * @param {String} dest the destination file name.
         * @return {Boolean} true in case file could be moved, otherwise false.
         */
        move: function (dest) {
            if (!result.file.copy(dest)) {
                return false;
            }
            if (!result.file["delete"]()) {
                return false;
            }
            result.file = new java.io.File(dest).getAbsoluteFile();
            return true;
        },

        /**
         * Removes (deletes) the file or directory.
         *
         * @return {Boolean} true if the file was removed, otherwise false.
         */
        remove: function() {
           return result.file["delete"]();
        }
    };
    return result;
};

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

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
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

if (!this.crash) {
    crash = {};
}

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

/*globals crash, java */

if (!this.crash) {
    crash = {};
}

if (!this.crash.timer) {
    crash.timer = {};
}

(function () {

    var nextId = 0;
    var timers = new java.util.Hashtable();

    /*
     * Creates a timer object which calls a function after the specified number of milliseconds.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @param (Boolean) repeat true if the function must be called repeatedly
     */
    var makeTimer = function (func, millis, repeat) {
        var timer = {
            func: func,
            wait: millis,
            repeat: repeat,
            when: new Date().getTime() + millis
        };
        var id = nextId;
        nextId += 1;
        timers.put(id.toString(), timer);
        return id;
    };

    var thread = new java.lang.Thread(new java.lang.Runnable({

        run: function () {
            var now = null;
            var keys = null;
            var key = null;
            var timer = null;
            var run = false;
            var length = 0;
            var i = 0;
            while (true) {
                now = new Date().getTime();
                run = false;
                keys = timers.keySet().toArray();
                length = keys.length;
                for (i = 0; i < length; i += 1) {
                    key = keys[i];
                    timer = timers.get(key);
                    if (timer !== null && timer.when <= now) {
                        run = true;
                        timer.func();
                        if (timer.repeat) {
                            timer.when += timer.wait;
                        }
                        else {
                            timers.remove(key);
                        }
                    }
                }
                if (!run) {
                    java.lang.Thread.currentThread().sleep(1);
                }
            }
        }
    }));
    thread.start();

    /**
     * Calls a function after the specified number of milliseconds.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @return {Number) the timer identifier.
     */
    crash.timer.setTimeout = function (func, millis) {
        return makeTimer(func, millis, false);
    };

    /**
     * Repeatedly calls a function with the specified number of milliseconds
     * delay between each call.
     *
     * @param {Function} func the function to call.
     * @param {Number) millis the number of milliseconds to wait.
     * @return {Number) the timer identifier.
     */
    crash.timer.setInterval = function (func, millis) {
        return makeTimer(func, millis, true);
    };

    /**
     * Removes a previously set timeout.
     *
     * @param {Number} id the timeout identifier.
     */
    crash.timer.clearTimeout = function (id) {
        crash.timer.clearInterval(id);
    };

    /**
     * Removes a previously set interval.
     *
     * @param {Number} id the iterval identifier.
     */
    crash.timer.clearInterval = function (id) {
        var ident = id.toString();
        var timer = timers.get(ident);
        if (timer !== null ) {
            timers.remove(ident);
        }
    };

    /**
     * Causes the program to pause for the specified number of milliseconds.
     *
     * @param {Number} millis the number of milliseconds to pause.
     */
    crash.timer.pause = function (millis) {
        java.lang.Thread.currentThread().sleep(millis);
    };
})();

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
 * Inspired by EJS - Embedded JavaScript, written by Edward Benson
 * http://www.edwardbenson.com/projects/ejs
*/

/*globals crash, java */

/**
 * @requires crash.file
 */

if (!this.crash) {
    crash = {};
}

crash.st = {

    cache: {},

    load: function (path, data, charset, delim) {
        var file = crash.file(path);
        var modified = file.lastModified();
        var cached = crash.st.cache[path];
        if (cached && cached.modified === modified) {
            return cached.render(data);
        }

        charset = charset || "UTF-8";
        delim = delim || '<';
        data = data || {};

        var compiled = {
            modified: modified,
            process: null,

            render : function (data) {

                var functions = {
                    include: function () {
                        var result = [];
                        var path = file.parent() + "/";
                        var length = arguments.length;
                        for (var i = 0; i < length; i += 1) {
                            var newPath = crash.file(path + arguments[i]);
                            if (!newPath.exists() || !newPath.isFile()) {
                                throw new Error('SimpleTemplate.include ' + arguments[i] + " (" + newPath + ") doesn't exist, or isn't a file");
                            }
                            if (result.length > 0) {
                                result.push("\n");
                            }
                            result.push(crash.st.load(path + arguments[i], data, charset, delim));
                        }
                        return result.join('');
                    }
                };

                return compiled.process.call(functions, data, functions);
            }
        }

        var text = file.readText(charset);
        var left = delim;
        var right = '';
        switch (left) {
            case '[':
                right = ']';
                break;
            case '<':
                right = '>';
                break;
            case '{':
                right = '}';
                break;
            default:
                throw new Error("SimpleTemplate: " + left + ' is not a supported deliminator');
                break;
        }

        var leftDelimiter = left + '%';
        var rightDelimiter = '%' + right;
        var leftEqual = left + '%=';
        var leftComment = left + '%#';

        var scan = function (receiver) {
            var leftDelimiterLength = leftDelimiter.length;
            var rightDelimiterLength = rightDelimiter.length;
            var start = 0;
            var end = text.length;
            var index = 0;
            var nextChar = '';
            while (start < end) {
                index = text.indexOf(leftDelimiter, index);
                if (index < 0) {
                    receiver(text.substring(start));
                    return;
                }
                else {
                    nextChar = text.charAt(index + leftDelimiterLength);
                    if (nextChar == '%') {
                        receiver('<');
                        receiver('%');
                        index += leftDelimiterLength + 1;
                    }
                    else {
                        receiver(text.substring(start, index));
                        if (nextChar === '=' || nextChar === '#') {
                            receiver(leftDelimiter + nextChar);
                            index += 1;
                        }
                        else {
                            receiver(leftDelimiter);
                        }
                        index += leftDelimiterLength;
                        start = index;
                        index = text.indexOf(rightDelimiter, index);
                        if (index < 0) {
                            receiver(text.substring(start));
                            receiver(rightDelimiter);
                            return;
                        }
                        else {
                            receiver(text.substring(start, index));
                            receiver(rightDelimiter);
                            index += rightDelimiterLength;
                            start = index;
                        }
                    }
                }
            }
        };

        function clean(content) {
            content = content.replace(/\\/g, '\\\\');
            content = content.replace(/\n/g, '\\n');
            content = content.replace(/"/g, '\\"');
            return content;
        }

        function outputLines(pre, cleaner, text, post) {
            var start = 0;
            var end = text.length;
            var index = 0;
            var str = '';
            while (start < end) {
                index = text.indexOf('\n', index);
                if (index < 0) {
                    str = cleaner ? clean(text.substring(start)) + '\\n' : text.substring(start);
                    buffer.push(pre + str + post + '\n');
                    return;
                }
                str = cleaner ? clean(text.substring(start, index)) + '\\n' : text.substring(start, index);
                buffer.push(pre + str + post + '\n');
                index += 1;
                start = index;
            }
        }

        var buffer = [];
        buffer.push("var ___p = [];");
        var startTag = null;

        scan(function (token) {
            if (startTag == null) {
                switch (token) {
                    case leftDelimiter:
                    case leftEqual:
                    case leftComment:
                        startTag = token;
                        break;
                    default:
                        outputLines('___p.push("',  true, token, '");');
                        break;
                }
            }
            else {
                switch (token) {
                    case rightDelimiter:
                        startTag = null;
                        break;
                    default:
                        switch (startTag) {
                            case leftDelimiter:
                                buffer.push(token);
                                break;
                            case leftEqual:
                                buffer.push('___p.push(' + token + ');');
                                break;
                            default:
                                buffer.push(token);
                                break;
                        }
                }
            }
        });

        var result = buffer.join('');
        var toBeEvaled = 'with(___view) {'
                           + 'with (___context) {'
                                + result
                               + 'return ___p.join("");'
                           + '}'
                       + '}';

        try {
            compiled.process = new Function("___context", "___view", toBeEvaled);
        }
        catch (e) {
            if (typeof JSLINT !== 'undefined') {
                JSLINT(result);
                var error = JSLINT.errors[0];
                var lintError = new SyntaxError();
                lintError.fileName = path;
                error.line += 1;
                lintError.lineNumber = error.line;
                lintError.message = error.reason + ' In ' + path + ' line ' + error.line + '.\n';
app.debug("lintError " + lintError.fileName + " " + lintError.lineNumber + " " + lintError.message);
                throw lintError;
            }
            else {
                throw e;
            }
        }

        crash.st.cache[path] = compiled;
        return compiled.render(data);
    }
};

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

/*jslint evil: false */
/*global crash */

/**
 * @requires crash.timer
 */

if (!this.crash) {
    crash = {};
}

if (!this.crash.test) {
    crash.test = {};
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
crash.test.utils = {

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
crash.test.assertions = function (totaliser) {

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
crash.test.runner = function (profile, timeout) {
    var timerId = null;
    var intervalId = null;
    var functionAssertions = null;
    var callbackAssertions = null;
    var callbacks = null;

    function setTestTimeout(code, millis) {
        return crash.timer.setTimeout(code, millis);
    }
    function setTestInterval(code, millis) {
        return crash.timer.setInterval(code, millis);
    }
    function clearTestTimeout(timerId) {
        crash.timer.clearTimeout(timerId);
    }
    function clearTestInterval(timerId) {
        crash.timer.clearInterval(timerId);
    }

    function cleanUp() {
        var i = 0;
        var total = profile.total;
        var removeProps = crash.test.utils.removeTotaliserProperties;
        for (; i < total; i += 1) {
            removeProps(profile.tests[i]);
        }
    }

    function abend(reason) {
        if (timerId) {
            clearTestTimeout(timerId);
        }
        if (intervalId) {
            clearTestInterval(intervalId);
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
        callbackAssertions = crash.test.assertions(profile.tests[index]);
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
                clearTestInterval(intervalId);
                intervalId = null;
                setTestTimeout(next, 0);
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

        intervalId = setTestInterval(waitForCallback, 100);
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
            if (intervalId) {
                clearTestInterval(intervalId);
            }
            cleanUp();
            profile.complete = true;
            return;
        }

        var test = profile.tests[profile.index];
        var testObject = test.testObject;
        functionAssertions = crash.test.assertions(test);
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
crash.test.unit = function (name, testObject, timeout) {
    var utils = crash.test.utils;
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
            if (testObject.crashTests) {
                testArray = testObject.crashTests;
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
            runner = crash.test.runner(profile, timeout);
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
crash.test.group = function (arrayOfUnitTests, timeout) {
    var utils = crash.test.utils;
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
            runner = crash.test.runner(profile, timeout);
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

/*global crash */

if (!this.crash) {
    crash = {};
}

crash.xml = {

    textEncode: function (text) {
        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
    },

    attrEncode: function (text) {
        return crash.xml.textEncode(text).replace("'", '&#39;').replace('"', '&quot;');
    },

    /**
     * Builds an element node.
     *
     * @param elem the element name.
     * @param attrs the element attributes.
     * @param text the optional element text.
     * @return the formatted element as a string.
     */
    buildNode: function (elem, attrs, text) {
        var xml = crash.xml;
        var elemText = [];
        elemText.push("<" + elem);
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                elemText.push(" " + attr + "='");
                elemText.push(xml.attrEncode(attrs[attr]) + "'");
            }
        }
        if (text) {
            elemText.push(">");
            elemText.push(xml.textEncode(text));
            elemText.push("</" + elem + ">");
        }
        else {
            elemText.push(" />");
        }
        return elemText.join('');
    }
};
