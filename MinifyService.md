# The Minify Service #

| ![http://frizione.googlecode.com/svn/trunk/docs/Images/minify.png](http://frizione.googlecode.com/svn/trunk/docs/Images/minify.png) | From the project home page you can select the JavaScript files to minify... |
|:------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------|

The Minify files contain a simple syntax to define the files to be joined, and where they are to be saved:
```
  /*minify to: /js/browser-unittester.cjs
         gzip: /js/browser-unittester.cjs.gz */
  <%= include('./json2.js', './xhr.js', '../dev/unit-test.js', './saver.js') %>
```

| The Minify results page displays the minify information. | ![http://frizione.googlecode.com/svn/trunk/docs/Images/minify-result.png](http://frizione.googlecode.com/svn/trunk/docs/Images/minify-result.png) |
|:---------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------|

[Back](http://code.google.com/p/frizione/)