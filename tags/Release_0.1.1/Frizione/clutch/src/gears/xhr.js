/*
 */

/*jslint evil: true */
/*global clutch, google, ActiveXObject */

if (!this.clutch) {
    clutch = {};
}

clutch.createRequest = function () {
    try {
        return google.gears.factory.create('beta.httprequest');
    }
    catch (e) {
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
                    // poo
                }
            }
        }
    }
    return null;
};

(function () {
    var clutch_timer = null;
    try {
        clutch_timer = google.gears.factory.create('beta.timer');
        clutch.setTimeout = function (code, millis) {
            return clutch_timer.setTimeout(code, millis);
        };
        clutch.clearTimeout = function (timerId) {
            clutch_timer.clearTimeout(timerId);
        };
    }
    catch (e) {
        clutch.setTimeout = function (code, millis) {
            return window.setTimeout(code, millis);
        };
        clutch.clearTimeout = function (timerId) {
            window.clearTimeout(timerId);
        };
    }
})();

clutch.executeRequest = function (method, url, optionalParams, optionalBody, handler) {
    var REQUEST_TIMEOUT_MS = 5000; // 5 seconds

    var request = clutch.createRequest();
    var terminated = false;
    var timerId = clutch.setTimeout(function() {
            terminated = true;
            if (request) {
                request.abort();
                request = null;
            }
            handler();
        }, REQUEST_TIMEOUT_MS);
    var n;
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
                    clutch.clearTimeout(timerId);

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
        request.send(optionalBody || null);

        return function () {
            if (request) {
                terminated = true;
                request.abort();
                request = null;
                clutch.clearTimeout(timerId);
            }
        };
    }
    catch(e) {
        terminated = true;
        request = null;
        clutch.clearTimeout(timerId);

        // Set a short timeout just to get off the stack so that the call flow is
        // the same as with successful requests (subtle bugs otherwise).
        clutch.setTimeout(handler, 0);

        // Return a nop function so that callers don't need to care whether we
        // succeeded if they want to abort the previous request.
        return function () {};
    }
};