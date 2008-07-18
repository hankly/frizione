/*--------------------------------------------------------------------------
 *  EJS - Embedded JavaScript, version 0.1.0
 *  Copyright (c) 2007 Edward Benson
 *  http://www.edwardbenson.com/projects/ejs
 *  ------------------------------------------------------------------------
 *
 *  EJS is freely distributable under the terms of an MIT-style license.
 *
 *  EJS is a client-side preprocessing engine written in and for JavaScript.
 *  If you have used PHP, ASP, JSP, or ERB then you get the idea: code embedded
 *  in <% // Code here %> tags will be executed, and code embedded in <%= .. %> 
 *  tags will be evaluated and appended to the output. 
 * 
 *  This is essentially a direct JavaScript port of Masatoshi Seki's erb.rb 
 *  from the Ruby Core, though it contains a subset of ERB's functionality. 
 * 
 *  Modified for use in the frizione project: http://code.google.com/p/frizione/
 *--------------------------------------------------------------------------*/

EjsView = function (path, charset, delim, data) {
	this.path = path;
    this.charset = charset;
    this.delim = delim;
    this.data = data;
};

EjsView.prototype.include = function () {

    var result = "";
    var path = new java.io.File(this.path).getCanonicalFile().getParentFile().toString() + "/";
    var length = arguments.length;
    for (var i = 0; i < length; i += 1) {
        var newPath = new java.io.File(path + arguments[i]).getCanonicalFile();
        if (!newPath.exists() || !newPath.isFile()) {
            throw new Error('EJSView.include ' + arguments[i] + " (" + newPath + ") doesn't exist, or isn't a file");
        }
        if (result.length > 0) {
            result += "\n";
        }
        result += new EJS(newPath.toString(), this.charset, this.delim).render(this.data);
    }
    return result;
};

EjsView.prototype.toText = function (input) {
	if (input === null || input === undefined) {
        return '';
    }
    if (input instanceof Date) {
		return input.toDateString();
    }
    if (input.toString) {
        return input.toString();
    }
    return '';
};

/**
 * Adaptation from the Scanner of erb.rb
 *
 * @param source the source text.
 * @param left the left hand side delimiter.
 * @param right the right hand side delimiter.
 */
EjsScanner = function (source, left, right) {
	this.leftDelimiter = left + '%';
	this.rightDelimiter = '%' + right;
	this.doubleLeft = left + '%%';
	this.doubleRight = '%%' + right;
	this.leftEqual = left + '%=';
	this.leftComment = left + '%#';
	if (left === '[') {
		this.SplitRegexp = /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/;
    }
    else {
        this.SplitRegexp = /(<%%)|(%%>)|(<%=)|(<%#)|(<%)|(%>\n)|(%>)|(\n)/;
    }

    this.source = source;
	this.stag = null;
	this.lines = 0;
};

EjsScanner.prototype = {

    /**
     * Split function like Ruby's: "abc".split(/b/) -> ['a', 'b', 'c']
     *
     * @param string the string to split.
     * @param regex the regular expression used to split the string.
     * @return the split result (an array of strings).
     */
    split: function (string, regex) {
	    var item = string;
	    var result = regex.exec(item);
	    var splitResult = new Array();
	    while (result !== null) {
		    var firstIndex = result.index;
		    if (firstIndex !== 0) {
			    splitResult.push(item.substring(0, firstIndex));
			    item = item.slice(firstIndex);
		    }
		    splitResult.push(result[0]);
		    item = item.slice(result[0].length);
		    result = regex.exec(item);
	    }
	    if (item !== '') {
		    splitResult.push(item);
	    }
	    return splitResult;
    },

    /* For each line, scan! */
    scan: function (block) {
	    var regex = this.SplitRegexp;
	    if (this.source !== '') {
	 	    var split = this.split(this.source, /\n/);
	 	    var length = split.length;
            for(var i = 0; i < length; i +=1) {
			    this.scanline(split[i], regex, block);
		    }
	    }
    },
  
    /* For each token, block! */
    scanline: function (line, regex, block) {
	    this.lines += 1;
	    var split = this.split(line, regex);
        var length = split.length;
 	    for (var i = 0; i < length; i += 1) {
	        var token = split[i];
            if (token !== null) {
                try {
                    block(token, this);
                }
                catch (e) {
                    e.message = "EjsScanner: " + this.lines + ", " + e.message;
                    throw e;
                }
            }
	    }
    }
};

/**
 * Adaptation from the Buffer of erb.rb
 */
EjsBuffer = function (preCmd, postCmd) {
	this.line = new Array();
	this.script = "";
	this.preCmd = preCmd;
	this.postCmd = postCmd;

    var length = preCmd.length;
    for (var i = 0; i < length; i += 1) {
		this.push(preCmd[i]);
	}
};

EjsBuffer.prototype = {
	
    push: function (cmd) {
	    this.line.push(cmd);
    },

    cr: function () {
        var join = this.line.join('; ');
        join = join.replace(/;; /g, '; ');
        this.script = this.script + join;
	    this.line = new Array();
	    this.script = this.script + "\n";
    },

    close: function () {
	    if (this.line.length > 0) {
            var length = this.postCmd.length;
            for (var i = 0; i < length; i += 1) {
                this.push(this.postCmd[i]);
            }
            var join = this.line.join('; ');
            join = join.replace(/;; /g, '; ');
            this.script = this.script + join;
            this.line = null;
	    }
    }
};

/**
 * Adaptation from the Compiler of erb.rb
 *
 * @param path the source path.
 * @param source the source text.
 * @param left the left delimiter, either '[' or '<'.
 */
EjsCompiler = function (path, source, left) {
    this.path = path;
    this.source = '';
    this.preCmd = ['___ejsO = "";'];
	this.postCmd = new Array();

    if (source !== null) {
        this.source = source;
	}

    left = left || '<';
	var right = '>';
	switch (left) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw new Error("EjsCompiler: " + left + ' is not a supported deliminator');
			break;
	}
	this.scanner = new EjsScanner(this.source, left, right);
	this.out = '';
};

EjsCompiler.prototype = {

    compile: function () {
    	this.out = '';

        var putCmd = "___ejsO += ";
	    var insertCmd = putCmd;
	    var buff = new EjsBuffer(this.preCmd, this.postCmd);
	    var content = '';
	    var clean = function (content) {
	        content = content.replace(/\\/g, '\\\\');
            content = content.replace(/\n/g, '\\n');
            content = content.replace(/"/g, '\\"');
            return content;
	    };

        this.scanner.scan(function (token, scanner) {
		    if (scanner.stag == null) {
			    //app.debug(token + '|' + (token === "\n"));
			    switch (token) {
				    case '\n':
					    content = content + "\n";
					    buff.push(putCmd + '"' + clean(content) + '";');
					    buff.cr()
					    content = '';
					    break;
				    case scanner.leftDelimiter:
				    case scanner.leftEqual:
				    case scanner.leftComment:
					    scanner.stag = token;
					    if (content.length > 0) {
                            // Should be content.dump in Ruby
						    buff.push(putCmd + '"' + clean(content) + '"');
					    }
					    content = '';
					    break;
				    case scanner.doubleLeft:
					    content = content + scanner.leftDelimiter;
					    break;
				    default:
					    content = content + token;
					    break;
			    }
		    }
		    else {
			    switch (token) {
				    case scanner.rightDelimiter:
					    switch (scanner.stag) {
						    case scanner.leftDelimiter:
							    if (content[content.length - 1] === '\n') {
								    content = content.substr(0, content.length - 1); // content.chop();
								    buff.push(content);
								    buff.cr();
							    }
							    else {
								    buff.push(content);
							    }
							    break;
						    case scanner.leftEqual:
							    buff.push(insertCmd + "toText(" + content + ")");
							    break;
					    }
					    scanner.stag = null;
					    content = '';
					    break;
				    case scanner.doubleRight:
					    content = content + scanner.rightDelimiter;
					    break;
				    default:
					    content = content + token;
					    break;
			    }
		    }
	    });

        if (content.length > 0)	{
		    // Should be content.dump in Ruby
		    buff.push(putCmd + '"' + clean(content) + '"');
	    }

	    buff.close();
        this.out = buff.script + ";";
	    var toBeEvaled = 'with(___view) {'
                           + 'with (___context) {'
                                + this.out
                               + 'return ___ejsO;'
                           + '}'
                       + '}';

        try {
		    this.process = new Function("___context", "___view", toBeEvaled);
	    }
        catch (e) {
		    if (typeof JSLINT !== 'undefined') {
			    JSLINT(this.out);
			    for (var i = 0; i < JSLINT.errors.length; i += 1) {
				    var error = JSLINT.errors[i];
				    if (error.reason !== "Unnecessary semicolon.") {
					    error.line++;
					    var lintError = new Error();
					    lintError.lineNumber = error.line;
					    lintError.message = error.reason;
				        lintError.fileName = this.path;
                        throw lintError;
				    }
			    }
		    }
            else {
			    throw e;
		    }
	    }
    }
};

EJScache = {};

EJS = function (path, charset, delim) {
    this.modified = fileutils.lastModified(path);
    var cached = EJScache[path];
    if (cached && cached.modified === this.modified) {
        return cached;
    }
    EJScache[path] = this;

    this.path = path;
    this.charset = charset || "UTF-8";
	this.delim = delim || '<';
    var text = fileutils.readText(path, this.charset);
    this.template = new EjsCompiler(path, text, this.delim);
	this.template.compile();
};

EJS.prototype = {
	render : function (data) {
		var view = new EjsView(this.path, this.charset, this.delim, data);
		return this.template.process.call(view, data, view);
	},

	out : function () {
		return this.template.out;
	}
};