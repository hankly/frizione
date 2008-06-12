#!/usr/local/bin/ruby -w

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

require 'compressor_servlet'
require 'join_servlet'
require 'jslint_servlet'
require 'fixture_servlet'
require 'projects_servlet'
require 'test_servlet'
require 'webrick'

# The Clutch Web Application
class ClutchServer < HTTPServer

    ROOT = '../Frizione/'

    def initialize(config = {})
        super(config)

        # Define the server mount points
        mount('/', HTTPServlet::FileHandler, ROOT)
        mount('/run-compressor', CompressorServlet)
        mount('/run-fixture', FixtureServlet)
        mount('/run-join', JoinServlet)
        mount('/run-jslint', JSLintServlet)
        mount('/run-projects', ProjectsServlet)
        mount('/run-test', TestServlet)
    end

end

# Create the server
server = ClutchServer.new(:Port => 80)

# trap signals to invoke the shutdown procedure cleanly
['INT', 'TERM'].each do |signal|
    trap(signal) { server.shutdown } 
end

# Start the server
server.start