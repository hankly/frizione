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

/*
Inspired by Aaron Boodman's Worker2 micro project
See http://groups.google.com/group/gears-users/browse_thread/thread/62a021c62828b8e4/67f494497639b641
*/

/*jslint evil: true */
/*global clutch, ActiveXObject */

if (!this.clutch) {
    clutch = {};
}

/**
 * A reduced version of /gears/xhr.js, but without gears. Performs an XHR.
 *
 * @param method can be "GET", possibly "POST".
 * @param url the absolute URL to get or post to.
 * @param optionalParams optional parameters, do your own value encoding though
 * @param optionalBody damn useful for posts
 * @param handler who to call when things go right, or wrong.
 */
clutch.executeRequest = function (method, url, optionalParams, optionalBody, handler) {
    var REQUEST_TIMEOUT_MS = 5000; // 5 seconds

    function createRequest() {
        try {
            return new XMLHttpRequest();
        }
        catch (e1) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e2) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (e3) {
                    // pooh!
                }
            }
        }
        return null;
    }

    var request = createRequest();
    var terminated = false;
    var timerId = setTimeout(function () {
            terminated = true;
            request = null;
            handler();
        }, REQUEST_TIMEOUT_MS);
    var n = null;
    var qmark = "?";

    if (optionalParams) {
        for (n in optionalParams) {
            if (optionalParams.hasOwnProperty(n)) {
                url += qmark + n + "=" + optionalParams[n];
                qmark = "";
            }
        }
    }

    try {
        request.onreadystatechange = function() {
            // IE fires onreadystatechange when you abort. Check to make sure we're
            // not in this situation before proceeding.
            if (terminated) {
                return;
            }

            try {
                if (request.readyState === 4) {
                    var status, statusText, responseText;

                    try {
                        status = request.status;
                        statusText = request.statusText;
                        responseText = request.responseText;
                    }
                    catch (e1) {
                        // We cannot get properties while the window is closing.
                    }

                    terminated = true;
                    request = null;
                    clearTimeout(timerId);

                    // Browsers return 0 for xhr against file://. Normalize this.
                    if (status === 0) {
                        status = 200;
                    }

                    handler(status, statusText, responseText);
                }
            }
            catch (e2) {
                throw e2;
            }
        };

        // Firefox throws on open() when it is offline; IE throws on send().
        request.open(method, url, true /* async */);
        if (optionalBody) {
            request.setRequestHeader('Content-Length', optionalBody.length);
        }
        request.send(optionalBody || null);
    }
    catch(e) {
        terminated = true;
        request = null;
        clearTimeout(timerId);

        // Set a short timeout just to get off the stack so that the call flow is
        // the same as with successful requests (subtle bugs otherwise).
        setTimeout(handler, 0);
    }
};