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
    var result = [];
    var path = new java.io.File(this.path).getCanonicalFile().getParentFile().toString() + "/";
    var length = arguments.length;
    for (var i = 0; i < length; i += 1) {
        var newPath = new java.io.File(path + arguments[i]).getCanonicalFile();
        if (!newPath.exists() || !newPath.isFile()) {
            throw new Error('EJSView.include ' + arguments[i] + " (" + newPath + ") doesn't exist, or isn't a file");
        }
        if (result.length > 0) {
            result.push("\n");
        }
        result.push(new EJS(newPath.toString(), this.charset, this.delim).render(this.data));
    }
    return result.join('');
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
	this.leftEqual = left + '%=';
	this.leftComment = left + '%#';
    this.source = source;
};

EjsScanner.prototype = {

    scan: function (block) {
        var src = this.source;
        var leftDelim = this.leftDelimiter;
        var rightDelim = this.rightDelimiter;
        var leftDelimLength = leftDelim.length;
        var rightDelimLength = rightDelim.length;
        var start = 0;
        var end = src.length;
        var index = 0;
        var nextChar = '';
        while (start < end) {
            index = src.indexOf(leftDelim, index);
            if (index < 0) {
                block(src.substring(start), this);
                return;
            }
            else {
                nextChar = src.charAt(index + leftDelimLength);
                if (nextChar == '%') {
                    index += leftDelimLength + 1;
                }
                else {
                    block(src.substring(start, index), this);
                    if (nextChar === '=' || nextChar === '#') {
                        block(leftDelim + nextChar, this);
                        index += 1;
                    }
                    else {
                        block(leftDelim, this);
                    }
                    index += leftDelimLength;
                    start = index;
                    index = src.indexOf(rightDelim, index);
                    if (index < 0) {
                        block(src.substring(start), this);
                        block(rightDelim, this);
                        return;
                    }
                    else {
                        block(src.substring(start, index), this);
                        block(rightDelim, this);
                        index += rightDelimLength;
                        start = index;
                    }
                }
            }
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
            right = '>';
			break;
        case '{':
            right = '}';
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

        var putCmd = "___p.push(";
	    var buffer = [];
        buffer.push("var ___p = [];");
        var startTag = null;

        function clean(content) {
	        content = content.replace(/\\/g, '\\\\');
            content = content.replace(/\n/g, '\\n');
            content = content.replace(/"/g, '\\"');
            return content;
	    }

        function lines(pre, post, cleaner, text) {
            var start = 0;
            var end = text.length;
            var index = 0;
            var str = '';
            while (start < end) {
                index = text.indexOf('\n', index);
                if (index < 0) {
                    str = cleaner ? clean(text.substring(start)) + '\\n' : text.substring(start);
                    buffer.push(pre + str + post + '\n');
                    return;
                }
                str = cleaner ? clean(text.substring(start, index)) + '\\n' : text.substring(start, index);
                buffer.push(pre + str + post + '\n');
                index += 1;
                start = index;
            }
        }

        this.scanner.scan(function (token, scanner) {
		    if (startTag == null) {
			    switch (token) {
				    case scanner.leftDelimiter:
				    case scanner.leftEqual:
				    case scanner.leftComment:
					    startTag = token;
					    break;
				    default:
					    lines('___p.push("', '");',  true, token);
                        break;
			    }
		    }
		    else {
			    switch (token) {
				    case scanner.rightDelimiter:
					    startTag = null;
					    break;
				    default:
                        switch (startTag) {
                            case scanner.leftDelimiter:
                                lines('', '', false, token);
                                break;
                            case scanner.leftEqual:
                                lines('___p.push(', ');', false, token);
                                break;
                            default:
                                lines('', '', false, token);
                                break;
                        }
                }
		    }
	    });

        this.out = buffer.join('');
	    var toBeEvaled = 'with(___view) {'
                           + 'with (___context) {'
                                + this.out
                               + 'return ___p.join("");'
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
//        return cached;
    }
    EJScache[path] = this;

    this.path = path;
    this.charset = charset || "UTF-8";
	this.delim = delim || '<';
app.debug("Start Read " + path + ", " + req.runtime);
    var text = fileutils.readText(path, this.charset);
app.debug("Start Compile " + req.runtime);
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