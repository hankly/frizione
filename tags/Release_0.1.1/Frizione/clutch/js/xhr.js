/*

*/

/*jslint evil: true */
/*global clutch, ActiveXObject */
/*members clutch, executeRequest, hasOwnProperty, length,
    onreadystatechange, open, readyState, responseText, send,
    setRequestHeader, status, statusText */

if (!this.clutch) {
    clutch = {};
}

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