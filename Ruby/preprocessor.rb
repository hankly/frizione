# User: john.leach

require 'erb'

class Preprocessor

    def initialize(filename, root)
        root = File.expand_path(root)
        @filepath = File.expand_path(filename, root)
        @template = ERB.new(IO.read(@filepath), nil, '%')
    end

    def include(*filenames)
        path, file = File.split(@filepath)
        filenames.map { |filename| Preprocessor.new(filename, path).to_s }.join("\n")
    end

    def to_s
        @template.result(binding)
    end

end