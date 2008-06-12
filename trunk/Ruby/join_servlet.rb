# Copyright (c) 2008 John Leach
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# User: john.leach

require 'create_dirs'
require 'erb'
require 'preprocessor'
require 'webrick'

include WEBrick

class JoinServlet < HTTPServlet::AbstractServlet

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
        <title>Join Results</title>
    </head>
    <body>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>Join Results</h1>
        <% if (error) %>
        <p>Error: <%= error %></p>
        <% else %>
        <p><code>From:</code> <%= from %></p>
        <p><code>&#160;&#160;To:</code> <a href='/<%= to %>'><%= to %></a> (<%= to_size %> bytes)</p>
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
    end

    def do_POST(request, response)
        from = request.path_info
        from = from[1..-1] if from[0...1] == '/'
        to = request.query['to']
        to = to[1..-1] if to[0...1] == '/'
        @logger.info "run-join from: #{from}, to: #{to}"

        from_path = File.expand_path(from, ClutchServer::ROOT)
        to_path = File.expand_path(to, ClutchServer::ROOT)
        if (!File.exists?(from_path))
            error = "#{request.path_info} doesn't exist!"
        elsif (from_path == to_path)
            error = "run-join: #{request.path_info} cannot be written to itself"
        else
            from_path, from_file = File.split(from_path)
            create_dirs(to_path)
            File.delete(to_path) if File.exists?(to_path)

            joined = Preprocessor.new(from_file, from_path).to_s
            File.open(to_path, "w") { |file|
                file << joined
            }
            to_size = File.size(to_path)
        end
        response.content_type = 'text/html'
        response.body = @html.result(binding)
    end

end