# User: john.leach

require 'create_dirs'
require 'erb'
require 'preprocessor'
require 'webrick'

include WEBrick

class TestServlet < HTTPServlet::AbstractServlet

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
        <title>Test Page Creation Results</title>
    </head>
    <body>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>Test Page Creation Results</h1>
        <% if (error) %>
        <p>Error: <%= error %></p>
        <% else %>
        <%   if (to == from) %>
        <p><code>Code:</code> <%= from %></p>
        <%   else %>
        <p><code>From:</code> <%= from %></p>
        <p><code>&#160;&#160;To:</code> <a href='/<%= to %>'><%= to %></a> (<%= to_size %> bytes)</p>
        <% end %>
        <p><code>&#160;Run:</code> <a href='/<%= run %>'><%= run %></a></p>
        <p><code>View:</code> <a href='/<%= view %>'><%= view %></a></p>
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

        @run_html = ERB.new <<-xXx
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <title>Clutch Run Test: '<%= to %>'</title>
        <link rel="stylesheet" href="/clutch/css/clutch.css" type="text/css" media="screen" charset="utf-8" />
        <script src="/clutch/js/json2.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/xhr.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/browser-saver.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/src/string.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/src/unit-test.js" type="text/javascript" charset="utf-8"></script>
        <script src="/<%= to %>" type="text/javascript" charset="utf-8"></script>
    </head>
    <body onload="storeClutchTests(runClutchTests, '/<%= json %>', '/<%= view %>');">
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>Clutch Run Test: '<%= to %>'</h1>
        <% if (run_comment) %>
        <p><%= run_comment %></p>
        <% end %>
        <div id="test-results">Running...</div>

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

        @view_html = ERB.new <<-xXx
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <title>Clutch View Test '<%= to %>'</title>
        <link rel="stylesheet" href="/clutch/css/clutch.css" type="text/css" media="screen" charset="utf-8" />
        <script src="/clutch/js/prototype/prototype.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/prototype/builder.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/src/string.js" type="text/javascript" charset="utf-8"></script>
        <script src="/clutch/js/display.js" type="text/javascript" charset="utf-8"></script>
        <script type="text/javascript">
            clutch.retrieveAndDisplay('/<%= json %>');
        </script>
    </head>
    <body>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>Clutch View Test '<%= to %>'</h1>
        <% if (view_comment) %>
        <p><%= view_comment %></p>
        <% end %>
        <div id="test-results"></div>

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
    end

    def do_POST(request, response)
        from = request.path_info
        from = from[1..-1] if from[0...1] == '/'
        to = request.query['to']
        if (to)
            to = to[1..-1] if to[0...1] == '/'
        else
            to = from
        end
        run = request.query['run']
        run = run[1..-1] if run[0...1] == '/'
        view = request.query['view']
        view = view[1..-1] if view[0...1] == '/'
        json = request.query['json']
        json = json[1..-1] if json[0...1] == '/'
        run_comment = request.query['run-comment']
        run_comment = nil if (!run_comment)
        view_comment = request.query['view-comment']
        view_comment = nil if (!view_comment)
        @logger.info "run-test from: #{from}, to: #{to}, run: #{run}, view: #{view}, json: #{json}"

        from_path = File.expand_path(from, ClutchServer::ROOT)
        to_size = File.size(from_path)
        run_content =  @html.result(binding)
        if (!File.exists?(from_path))
            error = "#{request.path_info} doesn't exist!"
        else
            if (from != to)
                from_path, from_file = File.split(from_path)
                joined = Preprocessor.new(from_file, from_path).to_s
                to_path = File.expand_path(to, ClutchServer::ROOT)
                create_dirs(to_path)
                File.delete(to_path) if File.exists?(to_path)
                File.open(to_path, "w") { |to_file|
                    to_file << joined
                }
                to_size = File.size(to_path)
            end
            run_path = File.expand_path(run, ClutchServer::ROOT)
            view_path = File.expand_path(view, ClutchServer::ROOT)

            create_dirs(run_path)
            File.delete(run_path) if File.exists?(run_path)
            create_dirs(view_path)
            File.delete(view_path) if File.exists?(view_path)

            File.open(run_path, "w") { |run_file|
                run_file << @run_html.result(binding)
            }
            File.open(view_path, "w") { |view_file|
                view_file << @view_html.result(binding)
            }
        end
        response.content_type = 'text/html'
        response.body = @html.result(binding)
    end

end