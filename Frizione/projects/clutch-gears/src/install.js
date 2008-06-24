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
/*global clutch, google, $, Builder,
    checkInstallation, checkPermission, askPermission, checkInstallationAndPermission */

// Simple check install and permission functions.
// I don't see any advantage in producing a generic library for these simple functions.

/**
 * Give visual feedback if Gears is installed, or not.
 */
function checkInstallation() {
    if (clutch.isGearsInstalled()) {
        $('installed').show();
    }
    else {
        var install = $('install');
        var attrs = { 'class': 'button' };
        attrs.href = "http://gears.google.com/?action=install" +
            "&message=" + encodeURIComponent("Clutch-Gears - Gears Installation") +
            "&return=" + encodeURIComponent("http://clutch.syger.it/projects/clutch-gears/static/install.html");
        install.insert({ bottom: Builder.node('a', attrs, "Install Gears now") });
        $('not-installed').show();
    }
}

/**
 * Give visual feedback if permission is granted (or not).
 */
function checkPermission() {
    if (clutch.isGearsInstalled()) {
        if (!clutch.gearsFactory().hasPermission) {
            var permission = $('permission');
            var attrs = { 'class': 'button', 'onclick': 'askPermission();' };
            permission.insert({ bottom: Builder.node('a', attrs, "Give 'Clutch-Gears' permission to run Gears now") });
            $('no-permission').show();
        }
        else {
            $('has-permission').show();
        }
    }
    else {
        $('no-permission').show();
    }
}

/**
 * Ask for permission to use Gears, pretty please.
 */
function askPermission() {

    // Observations:
    // The image is 32 x 32
    // The text provides no formatting, including spaces, tabs, and newlines.
    var result = clutch.gearsFactory().getPermission('Clutch-Gears Example Project',
            '/clutch/docs/Images/clutch-tiny.png',
            "Clutch-Gears is really, really harmless.\nPromise...\nYou can trust this program...");
    if (result) {
        $('now-has-permission').show();
    }
    else {
        $('still-no-permission').show();
    }
}

/**
 * Give visual feedback for Gears.
 */
function checkInstallationAndPermission() {
    document.observe('dom:loaded', function() {
        checkInstallation();
        checkPermission();
    });
}