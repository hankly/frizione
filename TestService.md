# The Test Service #

| ![http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests.png](http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests.png) | From the project home page you can select the JavaScript files to unit test... |
|:--------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------|

The Test files contain a simple syntax to define the files to be joined, and where the test results are to be stored:
```
  /*test to: /js/test/string.js
       json: /js/test/string.test.json */
  <%= include('../dev/string.js', './string.js') %>
```

| The Test results page displays the Test information. | ![http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-result.png](http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-result.png) |
|:-----------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|

| ![http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display1.png](http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display1.png) | The unit test result can then be displayed. The unit test report starts with a general summary of the results... |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------|

| This is followed by a more detailed report for each unit test... | ![http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display2.png](http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display2.png) |
|:-----------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|

| ![http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display3.png](http://frizione.googlecode.com/svn/trunk/docs/Images/unit-tests-display3.png) | Finally, errors, failures and log messages are displayed. |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------|

[Back](http://code.google.com/p/frizione/)