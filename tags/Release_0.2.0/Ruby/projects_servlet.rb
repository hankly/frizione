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

require 'webrick'

include WEBrick

class ProjectsServlet < HTTPServlet::AbstractServlet

    def initialize(server, *options)
        super(server, options)
    end

    def do_GET(request, response)
        @logger.info "run-projects"

        projects_path = File.expand_path('projects', ClutchServer::ROOT)
        json_text = '['
        comma = ''

        Dir.foreach(projects_path) { |dir|
            if (dir != '.' && dir != '..')
                project_path = File.expand_path(dir, projects_path)
                if (File.directory?(project_path))
                    json_path = File.expand_path('clutch.json', project_path)
                    if (File.exists?(json_path) && File.file?(json_path))
                        File.open(json_path, "r") { |file|
                            json_text += comma
                            comma = ','
                            json_text += file.read
                        }
                    end
                end
            end
        }

        json_text += ']'
        response.body = json_text
    end

end