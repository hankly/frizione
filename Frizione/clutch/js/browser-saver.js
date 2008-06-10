/*

*/

/*jslint evil: true */
/*global clutch, storeClutchTests, ActiveXObject */
/*members executeRequest, getElementById, innerHTML, run, stringify, summary */

function storeClutchTests(testFunction, jsonUrl, viewUrl) {

    function handleRequest(status, statusText, responseText) {
        var element = document.getElementById('test-results');
        if (status >= 200 && status <= 299) {
            element.innerHTML = "Unit tests <a href = '" + viewUrl + "'>completed</a> and stored.";
        }
        else {
            element.innerHTML = "Couldn't store the unit test data. Status: " + status + " " + statusText;
        }
    }

    jsonUrl = '/run-fixture' + jsonUrl;
    var tests = testFunction();
    tests.run();
    clutch.date.toClutchJSON();

    clutch.executeRequest("POST", jsonUrl, null, JSON.stringify(tests.summary(), null, "\t"), handleRequest);
}