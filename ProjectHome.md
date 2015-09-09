# Welcome to Frizione #
| ![http://frizione.googlecode.com/svn/trunk/Frizione/apps/frizione/StaticFiles/imgs/clutch-tiny.png](http://frizione.googlecode.com/svn/trunk/Frizione/apps/frizione/StaticFiles/imgs/clutch-tiny.png) | Frizione is a JavaScript development, testing and deployment environment. It comprises a   library   agnostic   set  of   tools   for   any   type  of  browser  based  JavaScript development, which coincidentally has [Gears](http://gears.google.com/) support. The current version of Frizione is 0.5 (22 August 2008) |
|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

## What's in the box? ##

Frizione provides:
  * local [JSLint](http://www.jslint.com) checking of your JavaScript code. [More...](JSLintService.md)
  * joining (concatenation) of JavaScript files to produce unique libraries. [More...](JoinService.md)
  * compression using the [YUICompressor](http://developer.yahoo.com/yui/compressor/) to reduce your CSS and JavaScript code to the bone. [More...](MinifyService.md)
  * generate documentation from tagged comments using [JsDoc Toolkit](http://jsdoctoolkit.org/). [More...](JsDocService.md)
  * a two stage unit testing framework, using your JavaScript code and a minimum framework to run the tests, which are stored to hard disk in JSON format. The results can then be displayed or analysed by other utilities. [More...](TestService.md)
  * now with asynchronous unit testing, too.
  * other useful tools, such as dynamic fixtures, which can help develop more complicated integration testing environments.

Frizione is also a small, but well tested JavaScript library, with extensions specifically for [Gears](http://gears.google.com/).

[Frizione](http://it.wikipedia.org/wiki/Frizione_%28meccanica%29) is also known as [Clutch](http://en.wikipedia.org/wiki/Clutch) in English.

## What's under the hood? ##

Frizione uses [Java](http://www.java.com/en/) and [Helma](http://www.helma.org/) to produce most of its magic. The rest is supplied by JavaScript itself.

## Want to know more? ##

Why not take a look at the [manual](http://frizione.googlecode.com/svn/trunk/docs/Clutch.pdf)? The project RoadMap should also give you an idea of how Frizione is progressing.

22 August 2008: The good news is that I've just released version 0.5.
