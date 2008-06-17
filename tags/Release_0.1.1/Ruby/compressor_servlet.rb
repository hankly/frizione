# User: john.leach

require 'erb'
require 'webrick'

include WEBrick

class CompressorServlet < HTTPServlet::AbstractServlet

    def initialize(server, *options)
        super(server, options)
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

    def do_POST(request, response)
        original = request.path_info
        original = original[1..-1] if original[0...1] == '/'
        line_break = request.query['line-break'] || 0.to_s
        charset = request.query['charset'] || 'UTF-8'
        output = request.query['output'] || original
        output = output[1..-1] if output[0...1] == '/'
        nomunge = request.query['nomunge'] || true;
        nomunge = false if (nomunge) == 'false'

        original_filepath = File.expand_path(original, ClutchServer::ROOT)
        if (!File.exists?(original_filepath))
            error = "#{request.path_info} doesn't exist!"
        else
            output_filepath = File.expand_path(output, ClutchServer::ROOT)
            original_size = File.size(original_filepath)

            options = '--line-break ' + line_break + ' --charset ' + charset + ' -o ' + output_filepath
            options += ' --nomunge' if (nomunge)
            @logger.info "run-compressor source: #{original}, #{options}"

            # See http://developer.yahoo.com/yui/compressor/
            results = %x{java -jar ../Java/yuicompressor-2.3.5.jar #{options} #{original_filepath} }
            status = $?
            output_size = File.size(output_filepath)
        end
        response.content_type = 'text/html'
        response.body = @html.result(binding)
    end

end