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
## User: john.leach

require 'create_dirs'
require 'erb'
require 'jsmin'
require 'webrick'

include WEBrick

class CompressorServlet < HTTPServlet::AbstractServlet

    COMPRESSOR = "java -jar ../Java/yuicompressor-2.3.5.jar"

    include CreateDirs

    def initialize(server, *options)
        super(server, options)
        @error = ""
        @html = ERB.new <<-xXx
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns='http://www.w3.org/1999/xhtml'>
    <head>
        <meta http-equiv="Content-Type" content='text/html; charset=UTF-8' />
        <link rel="stylesheet" href="/clutch/css/clutch.css" type="text/css" media="screen" charset="utf-8" />
        <title>Compressor Results</title>
    </head>
    <body>
        <p class="MenuHeading">
            <a href="/">Home</a>&#160;
            <a href="/jslint">JSLint</a>&#160;
            <a href="/joins">Join/Compress</a>&#160;
            <a href="/tests">Unit Tests</a>&#160;
            <a href="/clutch/docs/Clutch.pdf">Documentation</a>
        </p>

        <h1>Compressor Results</h1>
        <% if (error) %>
        <p>Error: <%= error %></p>
        <% else %>
        <p><code>&#160;&#160;&#160;&#160;&#160;&#160;Used:</code> <%= compressor %></p>
        <p><code>&#160;&#160;Original:</code> <%= original %> (<%= original_size %> bytes)</p>
        <p><code>Compressed:</code> <%= output %> (<%= output_size %> bytes)</p>
        <p><code>&#160;&#160;&#160;&#160;Status:</code> <%= status %></p>
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

    def runCompressor(input_filepath, output_filepath, options)
        begin
            results = %x{#{COMPRESSOR} #{options} #{input_filepath}}
            return $?
        rescue
            @error = "Couldn't run YUICompressor: #{COMPRESSOR} #{options} #{input_filepath}"
            return -1
        end
    end

    def runJSMin(input_filepath, output_filepath)
        input = nil
        output = nil
        begin
            create_dirs(output_filepath)
            File.delete(output_filepath) if File.exists?(output_filepath)
            input = File.new(input_filepath, "r")
            output = File.new(output_filepath, "w")
            JSMin.new(input, output)
            return 0
        rescue
            @error = "Couldn't execute JSMin: #{input_filepath} #{output_filepath}"
            return -1
        ensure
            input.close unless input.nil?
            output.close unless output.nil?
        end
    end

    def do_POST(request, response)
        original = request.path_info
        original = original[1..-1] if original[0...1] == '/'
        line_break = request.query['line-break'] || 0.to_s
        charset = request.query['charset'] || 'UTF-8'
        output = request.query['output'] || nil
        output = output[1..-1] if output && output[0...1] == '/'
        nomunge = request.query['nomunge'] || true;
        nomunge = false if (nomunge) == 'false'
        jsmin = request.query['jsmin'] || true;
        jsmin = false if (jsmin) == 'false'
        @logger.info "run-compressor source: #{original}, #{jsmin}"

        original_filepath = File.expand_path(original, ClutchServer::ROOT)
        original_size = File.size(original_filepath)
        output_filepath = nil
        @error = nil
        if (!File.exists?(original_filepath))
            @error = "run-compressor: #{request.path_info} doesn't exist"
        elsif (output.nil?)
            @error = "run-compressor: no output parameter specified"
        elsif (output)
            output_filepath = File.expand_path(output, ClutchServer::ROOT)
            if (original_filepath == output_filepath)
                @error = "run-compressor: #{request.path_info} cannot be written to itself"
            end
        end

        output_size = 0
        compressor = "JSMin"
        if (@error.nil?)
            if (jsmin)
                status = runJSMin(original_filepath, output_filepath)
            else
                compressor = "YUICompressor"
                options = '--line-break ' + line_break + ' --charset ' + charset + ' -o ' + output_filepath
                options += ' --nomunge' if (nomunge)
                # See http://developer.yahoo.com/yui/compressor/
                status = runCompressor(original_filepath, output_filepath, options)
            end
            output_size = File.size(output_filepath) if File.exists?(output_filepath)
        end

        error = @error
        response.content_type = 'text/html'
        response.body = @html.result(binding)
    end

end