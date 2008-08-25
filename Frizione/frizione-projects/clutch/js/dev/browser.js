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

/*global clutch, google */

if (!this.clutch) {

    /**
     * @namespace Clutch is a generic JavaScript library, with extensions for Gears.
     * The Clutch library code has been carefully designed to run inside a browser, or a Gears WorkerPool.
     */
    clutch = {};
}

// Browser sniffing. Disgusting, but sometimes necessary.
// Modified version of the Prototype library sniffer code.
/**
 * @namespace Clutch browser sniffer.
 * Sets one or more elements depending on the browser being used.
 */
clutch.browser =  {

    /**
     * Internet Explorer browser (if <code>true</code>).
     *
     * @type Boolean
     */
    IE:           !!window && (!!(window.attachEvent && !window.opera)),

    /**
     * Opera browser (if true).
     *
     * @type Boolean
     */
    Opera:        !!window && !!window.opera,

    /**
     * WebKit (Safari et al) browser (if <code>true</code>).
     *
     * @type Boolean
     */
    WebKit:       !!navigator && navigator.userAgent.indexOf('AppleWebKit/') > -1,

    /**
     * Gecko (Firefox et al) browser (if <code>true</code>).
     *
     * @type Boolean
     */
    Gecko:        !!navigator && navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,

    /**
     * Mobile Safari browser (if <code>true</code>).
     *
     * @type Boolean
     */
    MobileSafari: !!navigator && !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),

    /**
     * Gears enabled browser (if <code>true</code>).
     *
     * @type Boolean
     */
    Gears:        !!google && !!google.gears
};