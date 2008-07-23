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

/*globals crash */

if (!this.crash) {
    crash = {};
}

/**
 * Command line options processor.
 *
 * The options metadata consists of an array. Each element of the array is itself an array
 * of two elements per option:
 * <ul>
 *   <li>the long name, such as "preserve-semicolons"</li>
 *   <li>the short name, such as "ps"</li>
 * </ul>
 *
 * @param {Array} options the options metadata.
 * @param {Array} args the command line arguments.
 */
crash.Options = function (options, args) {
    var arguments = args;
    var longNames = {};
    var shortNames = {};
    var length = options.length;
    var i = 0
    var option = null;
    for (i = 0; i < length; i += 1) {
        option = options[i];
        longNames[option[0]] = option[1];
        shortNames[option[1]] = option[1];
    }

    /**
     * Traverses the command line arguments.
     *
     * For each argument in the command line, the supplied function is called with four parameters:
     * <ul>
     *   <li>the argument short name (or null if a plain value)</li>
     *   <li>the option value</li>
     *   <li>a flag to indictate that the option was found or not</li>
     * </ul>
     *
     * @param {Fuction} func the function which receives the command option.
     */
    this.each = function (func) {
        var arg = null;
        var names = null;
        var name = null;
        var shortName = null;
        var value = null;
        var pair = null;

        var length = arguments.length;
        var i = 0;
        var prefix = '';
        for (i = 0; i < length; i += 1) {
            arg = String(arguments[i]);
            shortName = null;
            if (arg.charAt(0) === "-") {

                if (arg.charAt(1) === "-") { // it's a longname like --foo
                    prefix = '--';
                    arg = arg.substring(2);
                    names = longNames;
                }
                else { // it's a shortname like -f
                    prefix = '-';
                    arg = arg.substring(1);
                    names = shortNames;
                }

                pair = arg.split("=");
                name = pair.shift();
                value = pair.shift();
                shortName = names[name];

                if (typeof value === "undefined") {
                    value = true;
                }

                if (shortName) {
                }
                else {
                }
            }
            else { // not associated with any option name
            }
        }
    };
};