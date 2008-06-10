# User: john.leach

module CreateDirs
    def create_dirs(path)
        pos = path.rindex('/')
        if (pos != nil) then
            path = path[0 .. pos - 1]
            if (!File.exist?(path)) then
                pos = path.index('/')
                while pos != nil do
                    subpath = path[0 .. pos - 1]
                    Dir.mkdir(subpath) if !File.exist?(subpath)
                    pos = path.index('/', pos + 1)
                end
                Dir.mkdir(path) if !File.exist?(path)
            end
        end
    end
end
