# The Join Service #

| ![http://frizione.googlecode.com/svn/trunk/docs/Images/join.png](http://frizione.googlecode.com/svn/trunk/docs/Images/join.png) | From the project home page you can select the JavaScript files to join... |
|:--------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------|

The Join files contain a simple syntax to define the files to be joined, and where they are to be saved:
```
  /*join to: /js/browser-unittester.cjs
       gzip: /js/browser-unittester.cjs.gz */
  <%= include('./json2.js', './xhr.js', '../dev/unit-test.js', './saver.js') %>
```

| The Join results page displays the join information. | ![http://frizione.googlecode.com/svn/trunk/docs/Images/join-result.png](http://frizione.googlecode.com/svn/trunk/docs/Images/join-result.png) |
|:-----------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|

[Back](http://code.google.com/p/frizione/)