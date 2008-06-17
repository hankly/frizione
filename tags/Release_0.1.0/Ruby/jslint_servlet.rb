# User: john.leach

require 'create_dirs'
require 'erb'
require 'webrick'

include WEBrick

class JSLintServlet < HTTPServlet::AbstractServlet

    include CreateDirs

    def initialize(server, *options)
        super(server, options)
        @html = ERB.new <<-xXx
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns='http://www.w3.org/1999/xhtml'>
    <head>
        <meta http-equiv="Content-Type" content='text/html; charset=UTF-8' />
        <link rel="stylesheet" href="/clutch/css/clutch.css" type="text/css" media="screen" charset="utf-8" />
        <title>JSLint Results</title>
    </head>
    <body>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>JSLint Results</h1>
        <% if (error) %>
        <p>Error: <%= error %></p>
        <% else %>
        <p>JSLint Test: <a href='<%= '/' + test_html %>'><%= url %> page</a></p>
        <% end %>

        <p>&#160;</p>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>
    </body>
</html>
xXx

        @jslint = ERB.new <<-xXx
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns='http://www.w3.org/1999/xhtml'>
    <head>
        <meta http-equiv="Content-Type" content='text/html; charset=UTF-8' />
        <link rel="stylesheet" href="/clutch/css/jslint.css" type="text/css" media="screen" charset="utf-8" />
        <script src="/clutch/js/xhr.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/jslint-loader.js" type="text/javascript" charset="utf-8"></script>
        <title>JSLint: The JavaScript Verifier: '<%= url %>'</title>
    </head>
    <body onload="loadJSLintCode('<%= url %>');">
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <table style="width: 100%">
            <tbody>
                <tr>
                    <td>
                        <img src="/clutch/images/jslint/jslint-small.gif" width="192" height="60" alt="JSLint" />
                    </td>
                    <td valign="middle" align="left">
                        <h1>
                            <a href="http://www.jslint.com">JSLint</a>:
                            The <a href="http://javascript.crockford.com/">JavaScript</a> Verifier: '<%= url %>'
                        </h1>
                        <p>
                            <a href="#options">Options</a>,
                            <a href="http://www.jslint.com/lint.html">Documentation</a>,
                            <a href="http://www.amazon.com/exec/obidos/ASIN/0596517742/wrrrldwideweb" target="_blank">
                                Book
                            </a>
                        </p>
                        <p>Edition 2008-06-04</p>
                    </td>
                </tr>
            </tbody>
        </table>

        <p>
            <textarea id='input' cols='100' rows='20'></textarea>
        </p>
        <p>
            <input type='button' name='jslint' value="JSLint" />
        </p>
        <div id='output'></div>
        <fieldset id='options'>
            <legend>Options</legend>
            <div>
                <input type='checkbox' id='passfail' title='passfail' />
                <label for='passfail' title='passfail'>Stop on first error</label>
                <br />
                <input type='checkbox' id='white' title='white' />
                <label for='white' title='white'>Strict whitespace</label>
                <br />
                <input type='checkbox' id='browser' title='browser' checked='checked' />
                <label for='browser' title='browser'>Assume a browser</label>
                <br />
                <input type='checkbox' id='widget' title='widget' />
                <label for='widget' title='widget'>Assume a <a href="http://widgets.yahoo.com/gallery/view.php?widget=37484">Yahoo Widget</a></label>
                <br />
                <input type='checkbox' id='sidebar' title='sidebar' />
                <label for='sidebar' title='sidebar'>Assume a <a href="http://msdn2.microsoft.com/en-us/library/aa965850(VS.85).aspx">Windows Sidebar Gadget</a></label>
                <br />
                <input type='checkbox' id='rhino' title='rhino' />
                <label for='rhino' title='rhino'>Assume <a href="http://www.mozilla.org/rhino/">Rhino</a></label>
                <br />
                <input type='checkbox' id='adsafe' title='adsafe' />
                <label for='adsafe' title='adsafe'><a href="http://www.ADsafe.org">ADsafe</a></label>
            </div>
            <div>
                <input type='checkbox' id='debug' title='debug' />
                <label for='debug' title='debug'>Tolerate <tt>debugger</tt> statements</label>
                <br />
                <input type='checkbox' id='evil' title='evil' />
                <label for='evil' title='evil'>Tolerate <tt>eval</tt></label>
                <br />
                <input type='checkbox' id='cap' title='cap' />
                <label for='cap' title='cap'>Tolerate <tt>HTML</tt> case</label>
                <br />
                <input type='checkbox' id='on' title='on' />
                <label for='on' title='on'>Tolerate <tt>HTML</tt> event handlers</label>
                <br />
                <input type='checkbox' id='fragment' title='fragment' />
                <label for='fragment' title='fragment'>Tolerate <tt>HTML</tt> fragments</label>
                <br />
                <input type='checkbox' id='laxbreak' title='laxbreak' />
                <label for='laxbreak' title='laxbreak'>Tolerate sloppy line breaking</label>
                <br />
                <input type='checkbox' id='forin' title='forin' />
                <label for='forin' title='forin'>Tolerate <a href="http://yuiblog.com/blog/2006/09/26/for-in-intrigue/">unfiltered</a> <tt>for in</tt></label>
            </div>
            <div>
                <input type='checkbox' id='undef' title='undef' checked='checked' />
                <label for='undef' title='undef'>Disallow undefined variables</label>
                <br />
                <input type='checkbox' id='nomen' title='nomen' checked='checked' />
                <label for='nomen' title='nomen'>Disallow leading <tt>_</tt> in identifiers</label>
                <br />
                <input type='checkbox' id='eqeqeq' title='eqeqeq' checked='checked' />
                <label for='eqeqeq' title='eqeqeq'>Disallow <tt>==</tt> and <tt>!=</tt></label>
                <br />
                <input type='checkbox' id='plusplus' title='plusplus' checked='checked' />
                <label for='plusplus' title='plusplus'>Disallow <tt>++</tt> and <tt>--</tt></label>
                <br />
                <input type='checkbox' id='bitwise' title='bitwise' checked='checked' />
                <label for='bitwise' title='bitwise'>Disallow bitwise operators</label>
                <br />
                <input type='checkbox' id='regexp' title='regexp' />
                <label for='regexp' title='regexp'>Disallow <tt>.</tt> in RegExp literals</label>
                <br />
                <input type='checkbox' id='glovar' title='glovar' checked='checked' />
                <label for='glovar' title='glovar'>Disallow global <tt>var</tt></label>
            </div>
            <br clear='all' />
            <p style="text-align: center;">
                <input type='button' id='clearall' value="Clear All Options" />&#160; &#160;
                <input type='button' id='recommended' value="Recommended Options" />&#160; &#160;
                <input type='button' id='goodparts' value="Good Parts" />
            </p>
            <div>
                <label for='indent' title='indent'>Indentation</label>
                <input id='indent' type='text' size='1' value="4" style="text-align: center;" />
                &#160; &#160; &#160;
                <label for='predef' title='predef'>Predefined <small>( <code>,</code> separated)</small></label>
                <input id='predef' type='text' size='32' style="text-align: center;" />
            </div>
        </fieldset>
        <p>
            Copyright 2002 <a href="http://www.JSLint.com/lint.html">Douglas Crockford.</a>
            <a target="_blank" href="http://www.crockford.com/">All Rights Reserved Wrrrldwide and Beyond!</a>
            <br />
            <a href="http://javascript.crockford.com/code.html" target="_blank">Code Conventions for the JavaScript Programming Language.</a>
            <br />
            <a href="http://tech.groups.yahoo.com/group/jslint_com/" target="_blank">Join the JSLint Group.</a>
        </p>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>
        <script src="/clutch/js/json2.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/jslint/webjslint.js" type="text/javascript" charset="utf-8"></script>
    </body>
</html>
xXx
    end

    def do_POST(request, response)
        url = request.path_info
        @logger.info "run-jslint URL: #{url}"
        source = url
        source = source[1..-1] if source[0...1] == '/'
        source_path, source_file = File.split(source)
        source_ext = File.extname(source)
        html_file = source_file[0 .. -(source_ext.length + 1)] + '.html'
        source_filepath = File.expand_path(source, ClutchServer::ROOT)
        if (!File.exists?(source_filepath))
            error = "#{url} doesn't exist!"
        else
            test_html = 'jslint/' + source_path + (source_path.length > 0 ? '/' : '') + html_file

            html_path = File.expand_path(test_html, ClutchServer::ROOT)
            create_dirs(html_path)
            File.delete(html_path) if File.exists?(html_path)
            File.open(html_path, "w") { |file|
                file << @jslint.result(binding)
            }
        end
        response.content_type = 'text/html'
        response.body = @html.result(binding)
    end

end