/*

*/

/*jslint evil: true */
/*global clutch, runClutchTests */

<%= include './string-tests.js', './unit-test-tests.js' %>

function runClutchTests() {
    return clutch.test.group([
            createUnitTests(),
            createStringTests()
        ], 30000);
}