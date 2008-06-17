#!/usr/local/bin/ruby -w

require 'compressor_servlet'
require 'join_servlet'
require 'jslint_servlet'
require 'fixture_servlet'
require 'test_servlet'
require 'webrick'

# The Clutch Web Application
class ClutchServer < HTTPServer

    ROOT = '../Clutch/'

    def initialize(config = {})
        super(config)

        # Define the server mount points
        mount('/', HTTPServlet::FileHandler, ROOT)
        mount('/run-compressor', CompressorServlet)
        mount('/run-fixture', FixtureServlet)
        mount('/run-join', JoinServlet)
        mount('/run-jslint', JSLintServlet)
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