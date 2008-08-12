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

crash.xml = {

    textEncode: function (text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    attrEncode: function (text) {
        return crash.xml.textEncode(text).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    },

    /**
     * Builds an attribute list.
     *
     * @param attrs the element attributes.
     * @return the formatted attributes as a string.
     */
    buildAttributes: function (attrs) {
        var xml = crash.xml;
        var elemText = [];
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                elemText.push(" " + attr + "='");
                elemText.push(xml.attrEncode(attrs[attr]) + "'");
            }
        }
        return elemText.length ? elemText.join('') : "";
    },

    /**
     * Builds an element node.
     *
     * @param elem the element name.
     * @param attrs the element attributes.
     * @param text the (optional) element text.
     * @param encode the (optional) element text encode flag (default is true).
     * @return the formatted element as a string.
     */
    buildNode: function (elem, attrs, text, encode) {
        var xml = crash.xml;
        var elemText = [];
        elemText.push("<" + elem);
        elemText.push(xml.buildAttributes(attrs));
        if (text) {
            elemText.push(">");
            if (typeof encode === 'undefined') {
                encode = true;
            }
            if (encode) {
                elemText.push(xml.textEncode(text));
            }
            else {
                elemText.push(text);
            }
            elemText.push("</" + elem + ">");
        }
        else {
            elemText.push(" />");
        }
        return elemText.join('');
    },

    /**
     * Builds an element node array.
     *
     * @param elem the element name.
     * @param attrs the element attributes.
     * @param values the array values.
     * @param encode the (optional) array values encode flag (default is true).
     * @return the formatted element node array as a string.
     */
    buildNodeArray: function (elem, attrs, values, encode) {
        var xml = crash.xml;
        var open = "<" + elem + xml.buildAttributes(attrs) + ">";
        var close = "</" + elem + ">";
        var elemText = [];
        var length = values.length;
        if (typeof encode === 'undefined') {
            encode = true;
        }
        for (var i = 0; i < length; i += 1) {
            if (encode) {
                elemText.push(open + xml.textEncode(values[i]) + close);
            }
            else {
                elemText.push(open + values[i] + close);
            }
        }
        return elemText.join('');
    }
};