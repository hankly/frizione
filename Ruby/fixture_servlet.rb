# User: john.leach

require 'create_dirs'
require 'erb'
require 'preprocessor'
require 'webrick'

include WEBrick

class FixtureServlet < HTTPServlet::AbstractServlet

    include CreateDirs

    def do_POST(request, response)
        to = request.path_info
        to = to[1..-1] if to[0...1] == '/'
        to_path = File.expand_path(to, ClutchServer::ROOT)
        from = request.query['from']
        from_path = nil
        from_file = nil
        body = nil
        param = request.query
        if (from)
            from = from[1..-1] if from[0...1] == '/'
            from_path = File.expand_path(from, ClutchServer::ROOT)
            from_path, from_file = File.split(from_path)
            @logger.info "run-fixture POST read: #{from}, write: #{to}"

            create_dirs(to_path)
            body = Preprocessor.new(from_file, from_path).to_s
        else
            from = ''
            @logger.info "run-fixture POST write: #{to}"
            body = request.body
        end

        File.open(to_path, "w") { |file|
            file << body
        }
        response.body = "OK"
    end

end