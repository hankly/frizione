/*jslint nomen: false */
/*globals JSDOC, IO, LOG, SYS, Link */

/** Turn a raw source file into a code-hilited page in the docs. */
function makeSrcFile(path, srcDir, name) {
	if (JSDOC.opt.s) {
        return;
    }

	if (!name) {
		name = path.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");
		name = name.replace(/\:/g, "_");
	}

	var src = {path: path, name:name, charset: IO.encoding, hilited: ""};

	if (JSDOC.PluginManager !== undefined) {
		JSDOC.PluginManager.run("onPublishSrc", src);
	}

	if (src.hilited) {
		IO.saveFile(srcDir, name+".html", src.hilited);
	}
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] !== undefined && b[attribute] !== undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) {
                return -1;
            }
			if (a > b) {
                return 1;
            }
			return 0;
		}
	};
}

/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet, template) {
	publish.conf = {  // trailing slash expected for dirs
		ext: ".html",
		outDir: SYS.pwd + (JSDOC.opt.d || "/out/jsdoc/"),
		templatesDir: SYS.pwd + template,
		symbolsDir: "symbols/",
		srcDir: "symbols/src/"
	};

    // is source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && Link !== undefined && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function(srcFilePath) {
			return "&lt;"+srcFilePath+"&gt;";
		};
	}

    // create the folders and subfolders to hold the output
    IO.mkPath((publish.conf.outDir+"symbols/src").split("/"));

    // used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

app.debug("publish templates " + req.runtime);

    // create the required templates
	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
		var classesTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allclasses.tmpl");
	}
	catch(e) {
		LOG.error("Couldn't create the required templates: ", e);
		return;
	}
	
    // some utility filters
	function hasNoParent($) {return $.memberOf === "";}
	function isaFile($) {return $.is("FILE");}
	function isaClass($) {return $.is("CONSTRUCTOR") || $.isNamespace;}

app.debug("publish sources " + req.runtime);

    // get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	var i, l;
	var files = JSDOC.opt.srcFiles;

    // create the hilited source code files
 	for (i = 0, l = files.length; i < l; i += 1) {
 		var file = files[i];
 		var srcDir = publish.conf.outDir + "symbols/src/";
		makeSrcFile(file, srcDir);
 	}

app.debug("publish classes " + req.runtime);

    // get a list of all the classes in the symbolset
    var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
	
    // create a class index, displayed in the left-hand column of every class page
	Link.base = "../";
 	publish.classesIndex = classesTemplate.process(classes); // kept in memory

    // create each of the class pages
    for (i = 0, l = classes.length; i < l; i += 1) {
        var symbol = classes[i];
        var output = "";
        output = classTemplate.process(symbol);

        IO.saveFile(publish.conf.outDir+"symbols/", symbol.alias+publish.conf.ext, output);
    }

app.debug("publish indices " + req.runtime);

    // regenerate the index with different relative links, used in the index pages
	Link.base = "";
	publish.classesIndex = classesTemplate.process(classes);
	
    // create the class index page
	try {
		var classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e1) {
        LOG.warn(e1.message);
        return;
    }
	
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, "index"+publish.conf.ext, classesIndex);
	classesindexTemplate = classesIndex = classes = null;
	
    // create the file index page
	try {
		var fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allfiles.tmpl");
	}
	catch(e2) {
        LOG.warn(e2.message);
        return;
    }
	
    var documentedFiles = symbols.filter(isaFile); // files that have file-level docs
    var allFiles = []; // not all files have file-level docs, but we need to list every one
	
	for (i = 0; i < files.length; i += 1) {
		allFiles.push(new JSDOC.Symbol(files[i], [], "FILE", new JSDOC.DocComment("/** */")));
	}
	
	for (i = 0; i < documentedFiles.length; i += 1) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}
		
	allFiles = allFiles.sort(makeSortby("name"));

    // output the file index page
	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, "files"+publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
}

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc !== "undefined") {
		return desc.match(/([\w\W]+?\.)[^a-z0-9]/i)? RegExp.$1 : desc;
    }
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var fullpath = publish.conf.templatesDir+path;
	return IO.readFile(fullpath);
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) {
        return "()";
    }
	var signature = "(" +
	params.filter(
		function($) {
			return $.name.indexOf(".") === -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ") +
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	return str;
}