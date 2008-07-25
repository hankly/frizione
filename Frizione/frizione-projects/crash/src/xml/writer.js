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