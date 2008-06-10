/*

*/

/*jslint evil: true */
/*global clutch, loadCode, ActiveXObject */
/*members executeRequest, getElementById, getTime, nocache, value */

function loadJSLintCode(url) {
    function handleRequest(status, statusText, responseText) {
        var input = document.getElementById('input');
        if (status >= 200 && status <= 299) {
            input.value = responseText;
        }
        else {
            var message = "Couldn't load the JavaScript file:\n" + url +
                          "\nStatus: " + status + " " + statusText;
            input.value = "/*\n" + message + "\n*/";
            alert(message);
        }
    }

    var params = { nocache: new Date().getTime() };
    clutch.executeRequest("GET", url, params, null, handleRequest);
}