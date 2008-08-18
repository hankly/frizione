/*
Copyright (c) 2008 John Leach.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*jslint nomen: false */
/*globals app, crash, java */
/*globals LOG, FilePath, SYS, IO */

LOG = {
    error: function(msg, e) {
        crash.logger.error(msg, e);
    },

    warn: function(msg, e) {
        crash.logger.warning(msg, e);
    },

    inform: function(msg) {
        crash.logger.info(msg);
    }
};

/**
 *	@class Manipulate a filepath.
 */
function FilePath(absPath, separator) {
	this.slash =  separator || "/";
	this.root = this.slash;
	this.path = [];
	this.file = "";

	var parts = absPath.split(/[\\\/]/);
	if (parts) {
		if (parts.length) {
            this.root = parts.shift() + this.slash;
        }
		if (parts.length) {
            this.file =  parts.pop();
        }
		if (parts.length) {
            this.path = parts;
        }
	}

	this.path = this.resolvePath();
}

/** Collapse any dot-dot or dot items in a filepath. */
FilePath.prototype.resolvePath = function() {
	var resolvedPath = [];
    var length = this.path.length;
	for (var i = 0; i < length; i += 1) {
		if (this.path[i] === "..") {
            resolvedPath.pop();
        }
		else if (this.path[i] !== ".") {
            resolvedPath.push(this.path[i]);
        }
	}
	return resolvedPath;
};

/** Trim off the filename. */
FilePath.prototype.toDir = function() {
	if (this.file) {
        this.file = "";
    }
	return this;
};

/** Go up a directory. */
FilePath.prototype.upDir = function() {
	this.toDir();
	if (this.path.length) {
        this.path.pop();
    }
	return this;
};

FilePath.prototype.toString = function() {
	return this.root +
		this.path.join(this.slash) +
		((this.path.length > 0)? this.slash : "") +
		this.file;
};

/**
 * Turn a path into just the name of the file.
 */
FilePath.fileName = function(path) {
	var nameStart = Math.max(path.lastIndexOf("/")+1, path.lastIndexOf("\\")+1, 0);
	return path.substring(nameStart);
};

/**
 * Get the extension of a filename
 */
FilePath.fileExtension = function(filename) {
   return filename.split(".").pop().toLowerCase();
};

/**
 * Turn a path into just the directory part.
 */
FilePath.dir = function(path) {
	var nameStart = Math.max(path.lastIndexOf("/")+1, path.lastIndexOf("\\")+1, 0);
	return path.substring(0, nameStart-1);
};

/**
 * @namespace A collection of information about your system.
 */
SYS = {
	/**
	 * Information about your operating system: arch, name, version.
	 * @type string
	 */
	os: [
		String(java.lang.System.getProperty("os.arch")),
		String(java.lang.System.getProperty("os.name")),
		String(java.lang.System.getProperty("os.version"))
	].join(", "),

	/**
	 * Which way does your slash lean.
	 * @type string
	 */
	slash: java.lang.System.getProperty("file.separator") || "/",

	/**
	 * The path to the working directory where you ran java.
	 * @type string
	 */
	userDir: String(java.lang.System.getProperty("user.dir")),

	/**
	 * Where is Java's home folder.
	 * @type string
	 */
	javaHome: String(java.lang.System.getProperty("java.home")),

	/**
	 * The absolute path to the directory containing this script.
	 * @type string
	 */
	pwd: app.getServerDir()
};

IO = {

    /**
     * Create a new file in the given directory, with the given name and contents.
     */
    saveFile: function(/**string*/ outDir, /**string*/ fileName, /**string*/ content) {
        var out = new java.io.PrintWriter(
            new java.io.OutputStreamWriter(
                new java.io.FileOutputStream(outDir + SYS.slash + fileName),
                IO.encoding)
        );
        out.write(content);
        out.flush();
        out.close();
    },

    /**
     * @type string
     */
    readFile: function(/**string*/ path) {
        if (!IO.exists(path)) {
            throw new Error("File doesn't exist there: "+path);
        }
        return crash.file(path).readText(IO.encoding);
    },

    /**
     * @param inFile
     * @param outDir
     * @param [fileName=The original filename]
     */
    copyFile: function(/**string*/ inFile, /**string*/ outDir, /**string*/ fileName) {
        if (fileName === null) {
            fileName = FilePath.fileName(inFile);
        }

        inFile = new java.io.File(inFile);
        var outFile = new java.io.File(outDir+SYS.slash+fileName);

        var bis = new java.io.BufferedInputStream(new java.io.FileInputStream(inFile), 4096);
        var bos = new java.io.BufferedOutputStream(new java.io.FileOutputStream(outFile), 4096);
        var theChar;
        while ((theChar = bis.read()) !== -1) {
            bos.write(theChar);
        }
        bos.close();
        bis.close();
    },

    /**
     * Creates a series of nested directories.
     */
    mkPath: function(/**Array*/ path) {
        if (path.constructor !== Array) {
            path = path.split(/[\\\/]/);
        }
        var make = "";
        for (var i = 0, l = path.length; i < l; i += 1) {
            make += path[i] + SYS.slash;
            if (!IO.exists(make)) {
                IO.makeDir(make);
            }
        }
    },

    /**
     * Creates a directory at the given path.
     */
    makeDir: function(/**string*/ path) {
        var file = new java.io.File(path);
        file.mkdir();
    },

    /**
     * @type string[]
     * @param dir The starting directory to look in.
     * @param [recurse=1] How many levels deep to scan.
     * @returns An array of all the paths to files in the given dir.
     */
    ls: function(/**string*/ dir, /**number*/ recurse, _allFiles, _path) {
        if (_path === undefined) { // initially
            _allFiles = [];
            _path = [dir];
        }
        if (_path.length === 0) {
            return _allFiles;
        }
        if (recurse === undefined) {
            recurse = 1;
        }

        dir = new java.io.File(dir);
        if (!dir.directory) {
            return [String(dir)];
        }
        var files = dir.list();

        for (var f = 0; f < files.length; f += 1) {
            var file = String(files[f]);
            if (file.match(/^\.[^\.\/\\]/)) {
                continue; // skip dot files
            }

            var directory = new java.io.File(_path.join(SYS.slash)+SYS.slash+file);
            if (directory.isDirectory()) { // it's a directory
                _path.push(file);
                if (_path.length-1 < recurse) {
                    IO.ls(_path.join(SYS.slash), recurse, _allFiles, _path);
                }
                _path.pop();
            }
            else {
                _allFiles.push((_path.join(SYS.slash)+SYS.slash+file).replace(SYS.slash+SYS.slash, SYS.slash));
            }
        }

        return _allFiles;
    },

    /**
     * @type boolean
     */
    exists: function(/**string*/ path) {
        var file = new java.io.File(path);

        if (file.isDirectory()){
            return true;
        }
        if (!file.exists()){
            return false;
        }
        if (!file.canRead()){
            return false;
        }
        return true;
    },

    /**
     *
     */
    open: function(/**string*/ path, /**string*/ append) {
        if (typeof append === undefined) {
            append = true;
        }
        var outFile = new java.io.File(path);
        var out = new java.io.PrintWriter(
            new java.io.OutputStreamWriter(
                new java.io.FileOutputStream(outFile, append),
                IO.encoding)
        );
        return out;
    },

    /**
     * Sets {@link IO.encoding}.
     * Encoding is used when reading and writing text to files,
     * and in the meta tags of HTML output.
     */
    setEncoding: function(/**string*/ encoding) {
        if (/ISO-8859-([0-9]+)/i.test(encoding)) {
            IO.encoding = "ISO8859_"+RegExp.$1;
        }
        else {
            IO.encoding = encoding;
        }
    },

    /**
     * @default "utf-8"
     * @private
     */
    encoding: "utf-8"
};

crash.load("frizione/third-party/jsdoc-toolkit/frame/");
crash.load("frizione/third-party/jsdoc-toolkit/lib/");
crash.load("frizione/third-party/jsdoc-toolkit/lib/JSDOC/");
crash.load("frizione/third-party/jsdoc-toolkit/plugins/");
