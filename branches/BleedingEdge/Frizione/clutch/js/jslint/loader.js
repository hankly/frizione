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
/*global clutch */

/**
 * Loads the JavaScript source code file into the generated JSLint page.
 * If you make changes to the JavaScript source file (yours, not this one)
 * remember to refresh the page.
 *
 * @param url the absolute URL to the JavaScript source code file.
 */
function loadJSLintCode(url) {
    function handleRequest(status, statusText, responseText) {
        var input = document.getElementById('input');
        if (status >= 200 && status <= 299) {
            input.value = responseText;
        }
        else {
            var message = "Couldn't load the JavaScript file:\n" + url + "\nStatus: " + status + " " + statusText;
            input.value = "/*\n" + message + "\n*/";
            alert(message);
        }
    }

    var params = { nocache: new Date().getTime() };
    clutch.executeRequest("GET", url, params, null, handleRequest);
}