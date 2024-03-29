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
/*global clutch, runClutchTests */

/*test to: /js/test/all-wp.js
     json: /js/test/all-wp.test.json
     type: workerpool */
<%= this.include('../dev/gears/gears.js', '../dev/gears/timer.js', '../dev/string.js', '../dev/gears/xhr.js', '../dev/gears/db-utils.js', '../dev/gears/db-logger.js') %>
<%= this.include('../dev/json2.js', '../dev/unit-test.js', '../dev/gears/wp-messages.js', '../dev/gears/wp-unit-test.js') %>
<%= this.include('./string.js', './unit-test.js', './gears/timer.js', './gears/xhr.js', './gears/db.js') %>

function runClutchTests() {
    return clutch.test.group([
            createUnitTests(),
            createStringTests(),
            createTimerTests(),
            createXhrTests(),
            createDatabaseTests()
        ], 12000);
}