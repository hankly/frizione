# The Frizione Road Map #

Frizione is still in its infancy. Until it reaches the ultimate open source project stability goal (that is to say version 1.0), it will probably duck and weave around numerous problems, possibly finding solutions, and most likely making breaking changes with respect to previous versions.

Currently I'm working on reaching version 0.5, which has better integration with Rhino based tools, and will add other JavaScript based tools. I'll also be spending a little time on extending the Clutch library, which is pretty anemic at the moment.

I've had an interesting email discussion with Michael Mathews, the author of [JsDoc Toolkit](http://jsdoctoolkit.org/) which has inspired me to take a slightly different look at the current frizione codebase. Essentially, there is a lot of useful code locked away inside a JavaScript based server - and it needn't be.

The game plan is as follows:
  * Create a command line version of Frizione
  * Extract Rhino based JavaScript code into it's own library called Crash
  * Let the Clutch library reuse parts of Crash that don't depend on Java
  * Let Frizione the web server use Crash, and it's own library called Frizione
  * Build a command line version of Frizione which also uses the Frizione library

Pretty challenging I'll admit, but the end result is a small codebase shared by three projects, most of which can be reused by other Rhino based projects.

Some of these changes will unfortunately break code based on the previous (0.4, 0.3, 0.2 or 0.1.1) versions. I don't like breaking code, because I probably have more code reliant on Frizione than anyone, so I'm also upsetting myself. I can unfortunately envisage that further breakages are very likely as Clutch gradually takes form.

The next step is to start developing the Gears project that I had to put on a back burner to develop Frizione. As the Gears project evolves, I will make 'battle hardening' modifications to Frizione.