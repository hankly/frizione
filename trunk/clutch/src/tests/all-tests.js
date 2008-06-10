/*

*/

/*jslint evil: true */
/*global clutch, runClutchTests */

<%= include './string-tests.js', './unit-test-tests.js' %>

function runClutchTests() {
    return clutch.unittests([
        createUnitTests(),
        createStringTests()
    ]);
}