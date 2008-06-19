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
        params = request.query
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
    end

end