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

/*jslint evil: false */
/*global clutch, google */

function createTimerTests() {

    return clutch.test.unit('Timer Tests', {

        clutchTests: [
            { func: 'startSetTimeout', callbacks: [ 'timerSetTimeout' ] },
            { func: 'startSetInterval', callbacks: [ 'timerSetInterval' ] }
        ],

        timerId: null,
        timerStart: null,

        startSetTimeout: function () {
            this.timerId = clutch.timer.setTimeout(this.timerSetTimeout, 250);
            this.timerStart = new Date().getTime();
            this.assert(this.timerId !== null, "Timer Id is null");
        },

        timerSetTimeout: function () {
            clutch.timer.clearTimeout(this.timerId);
            var time = new Date().getTime() - this.timerStart;
            // be generous, timers aren't very precise
            this.assert(time >= (250 - 25), "Time <= 250 ms (" + time + ")");
        },

        startSetInterval: function () {
            this.timerId = clutch.timer.setInterval(this.timerSetInterval, 250);
            this.timerStart = new Date().getTime();
            this.assert(this.timerId !== null, "Timer Id is null");
        },

        timerSetInterval: function () {
            clutch.timer.clearTimeout(this.timerId);
            var time = new Date().getTime() - this.timerStart;
            // be generous, timers aren't very precise
            this.assert(time >= (250 - 25), "Time <= 250 ms (" + time + ")");
        }
    }, 1000);
}

function runClutchTests() {
    return createTimerTests();
}