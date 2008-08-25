/*jslint evil: true, nomen: false */
/*globals JSDOC, IO, LOG, SYS */

/**
	@constructor
	@param [opt] Used to override the commandline options. Useful for testing.
	@version $Id: JsDoc.js 592 2008-05-09 07:43:33Z micmath $
*/
JSDOC.JsDoc = function(/**object*/ opt) {
	if (opt) {
		JSDOC.opt = opt;
	}
	
	// the -c option: use a configuration file
    var c;
	if (JSDOC.opt.c) {
		eval("JSDOC.conf = " + IO.readFile(JSDOC.opt.c));
		
		LOG.inform("Using configuration file at '"+JSDOC.opt.c+"'.");
		
		for (c in JSDOC.conf) {
			if (c !== "D" && JSDOC.opt[c] !== undefined) { // commandline overrules config file
				JSDOC.opt[c] = JSDOC.conf[c];
			}
		}
		
		if (typeof JSDOC.conf._ !== "undefined") {
			JSDOC.opt._ = JSDOC.opt._.concat(JSDOC.conf._);
		}
		
		LOG.inform("With configuration: ");
		for (var o in JSDOC.opt) {
            if (JSDOC.opt.hasOwnProperty(o)) {
                LOG.inform("    "+o+": "+JSDOC.opt[o]);
            }
        }
	}
	
	if (JSDOC.opt.h) {
		JSDOC.usage();
		return;
	}
	
	// defend against options that are not sane 
	if (JSDOC.opt._.length === 0) {
		LOG.warn("No source files to work on. Nothing to do.");
		return;
	}
	if (JSDOC.opt.t === true || JSDOC.opt.d === true) {
		JSDOC.usage();
	}
	
	if (typeof JSDOC.opt.d === "string") {
		if (!JSDOC.opt.d.charAt(JSDOC.opt.d.length-1).match(/[\\\/]/)) {
			JSDOC.opt.d = JSDOC.opt.d+"/";
		}
		LOG.inform("Output directory set to '"+JSDOC.opt.d+"'.");
		IO.mkPath(SYS.pwd + JSDOC.opt.d);
	}
	if (JSDOC.opt.e) {
        IO.setEncoding(JSDOC.opt.e);
    }
	
	// the -r option: scan source directories recursively
	if (typeof JSDOC.opt.r === "boolean") {
        JSDOC.opt.r = 10;
    }
	else if (!isNaN(parseInt(JSDOC.opt.r, 10))) {
        JSDOC.opt.r = parseInt(JSDOC.opt.r, 10);
    }
	else {
        JSDOC.opt.r = 1;
    }
	
	// the -D option: define user variables
	var D = {};
	if (JSDOC.opt.D) {
		for (var i = 0; i < JSDOC.opt.D.length; i += 1) {
			var defineParts = JSDOC.opt.D[i].split(":", 2);
			if (defineParts) {
                D[defineParts[0]] = defineParts[1];
            }
		}
	}
	JSDOC.opt.D = D;
	// combine any conf file D options with the commandline D options
	if (JSDOC.conf !== undefined) {
        for (c in JSDOC.conf.D) {
            if (JSDOC.opt.D[c] === undefined) {
                JSDOC.opt.D[c] = JSDOC.conf.D[c];
            }
        }
    }

	// Load additional file handlers
	// the -H option: filetype handlers
	JSDOC.handlers = {};
/*	
	if (JSDOC.opt.H) {
		for (var i = 0; i < JSDOC.opt.H.length; i++) {
			var handlerDef = JSDOC.opt.H[i].split(":");
			LOG.inform("Adding '." + handlerDef[0] + "' content handler from handlers/" + handlerDef[1] + ".js");
			IO.include("handlers/" + handlerDef[1] + ".js");
			if (!eval("typeof "+handlerDef[1])) {
				LOG.warn(handlerDef[1] + "is not defined in "+handlerDef[1] + ".js");
			}
			else {
				JSDOC.handlers[handlerDef[0]] = eval(handlerDef[1]);
			}
		}
	}
*/	
	// Give plugins a chance to initialize
	if (JSDOC.PluginManager !== undefined) {
		JSDOC.PluginManager.run("onInit", this);
	}

	JSDOC.opt.srcFiles = this._getSrcFiles();
	this._parseSrcFiles();
	//var handler = symbols.handler;
	this.symbolSet = JSDOC.Parser.symbols;
	//this.symbolGroup.handler = handler;
};

/**
	Retrieve source file list.
	@returns {String[]} The pathnames of the files to be parsed.
 */
JSDOC.JsDoc.prototype._getSrcFiles = function() {
	this.srcFiles = [];
	
	var ext = ["js"];
	if (JSDOC.opt.x) {
		ext = JSDOC.opt.x.split(",").map(function($) {
            return $.toLowerCase();
        });
	}

    function getExt($) {
        var thisExt = $.split(".").pop().toLowerCase();
        return (ext.indexOf(thisExt) > -1 || thisExt in JSDOC.handlers); // we're only interested in files with certain extensions
    }

    for (var i = 0; i < JSDOC.opt._.length; i += 1) {
		this.srcFiles = this.srcFiles.concat(IO.ls(SYS.pwd + JSDOC.opt._[i], JSDOC.opt.r).filter(getExt));
	}

    return this.srcFiles;
};

JSDOC.JsDoc.prototype._parseSrcFiles = function() {
	JSDOC.Parser.init();
    var srcFile;
    var src;
	for (var i = 0, l = this.srcFiles.length; i < l; i += 1) {
		srcFile = this.srcFiles[i];
		
		try {
			src = IO.readFile(srcFile);
		}
		catch(e) {
			LOG.error("Can't read source file '"+srcFile+"'", e);
		    return;
        }

        // Check to see if there is a handler for this file type
//		var ext = FilePath.fileExtension(srcFile);
// 		if (JSDOC.handlers[ext]) {
// 			LOG.inform(" Using external handler for '" + ext + "'");
// 
// 			symbols = symbols.concat(JSDOC.handlers[ext].handle(srcFile, src));
// 			symbols.handler = JSDOC.handlers[ext];
// 		}
// 		else {
			// The default (JSDOC) handler
			var tr = new JSDOC.TokenReader(src);
			var ts = new JSDOC.TokenStream(tr.tokenize());

			JSDOC.Parser.parse(ts, srcFile);
//		}
	}
	JSDOC.Parser.finish();
};