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

/**
  * Macro that counts filtered project files.
  *
  * Parameters:
  * <ul>
  * <li><code>action</code> action value.</li>
  * <li><code>dir</code> the project directory.</li>
  * <li><code>list</code> the project files list.</li>
  * <li><code>includes</code> a comma separeated list of extensions.</li>
  * <li><code>excludes</code> an optional comma separated list of excluded extensions.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function filesCount_macro(params) {
    var action = (params && params.action) ? params.action : null;
    var dir = (params && params.dir) ? params.dir : null;
    var list = (params && params.list) ? params.list : null;
    var includes = (params && params.includes) ? params.includes : null;
    var excludes = (params && params.excludes) ? params.excludes : null;
    if (dir === null || list === null || includes === null || action === null) {
        return "[Missing parameters: No files found]";
    }

    includes = includes.split(/\s?,\s?/);
    excludes = excludes ? excludes.split(/\s?,\s?/) : null;
    var result = fileutils.filterList(list, includes, excludes);
    if (result.length > 0) {
        var units = result.length === 1 ? "file" : "files";
        return "<a href='/frizione/" + dir + "/" + action + "'>" + result.length + " " + units + "</a>";
    }
    else {
        return "No files found";
    }
}

/**
  * Macro that lists filtered project files.
  *
  * Required parameters:
  * <ul>
  * <li><code>action</code> action value.</li>
  * <li><code>dir</code> the project directory.</li>
  * <li><code>list</code> the project files list.</li>
  * <li><code>includes</code> a comma separeated list of extensions.</li>
  * <li><code>excludes</code> an optional comma separated list of excluded extensions.</li>
  * </ul>
  *
  * @param params invocation parameters.
  */
function filesList_macro(params) {
    var action = (params && params.action) ? params.action : null;
    var dir = (params && params.dir) ? params.dir : null;
    var list = (params && params.list) ? params.list : null;
    var includes = (params && params.includes) ? params.includes : null;
    var excludes = (params && params.excludes) ? params.excludes : null;
    if (dir === null || list === null || includes === null || action === null) {
        return "<p>[Missing parameters: No files found]</p>";
    }

    includes = includes.split(/\s?,\s?/);
    excludes = excludes ? excludes.split(/\s?,\s?/) : null;
    var result = fileutils.filterList(list, includes, excludes);
    var length = result.length;
    if (length > 0) {
        var html = "";
        for (var i = 0; i < length; i += 1) {
            var file = result[i];
            html += "<p>"
                      + "<a href='/frizione/" + dir + "/" + action + encode(file) + "'>"
                          + "<code>" + encode("/" + dir + file) + "</code>"
                      + "</a>"
                  + "</p>";
        }
        return html;
    }
    else {
        return "<p>No files found</p>";
    }
}