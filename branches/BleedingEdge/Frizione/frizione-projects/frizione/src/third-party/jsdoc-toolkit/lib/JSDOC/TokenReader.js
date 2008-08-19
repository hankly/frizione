/*globals JSDOC */

if (typeof JSDOC === "undefined") {
    JSDOC = {};
}

String.prototype.isAlpha = function () {
    return (this >= 'a' && this <= 'z\uffff') || (this >= 'A' && this <= 'Z\uffff');
};


String.prototype.isDigit = function () {
    return (this >= '0' && this <= '9');
};

/**
	@class Search a {@link JSDOC.TextStream} for language tokens.
*/
JSDOC.TokenReader = function (text) {
    text = text || "";
    this.text = text;
    this.chars = text.split('');
    this.length = text.length;
    this.cursor = 0;
	this.keepDocs = true;
	this.keepWhite = false;
	this.keepComments = false;
};

JSDOC.TokenReader.prototype.eof = function () {
    return this.cursor >= this.length;
};

JSDOC.TokenReader.prototype.look = function (n) {
    n = n || 0;

	if ((this.cursor + n) < 0 || (this.cursor + n) >= this.length) {
		return "";
	}

	return this.chars[this.cursor + n];
};

JSDOC.TokenReader.prototype.next = function () {
    var text = this.chars[this.cursor];
    this.cursor += 1;
	return text;
};

/**
	@type {JSDOC.Token[]}
 */
JSDOC.TokenReader.prototype.tokenize = function () {
    var ws = JSDOC.Lang.whitespace.names;
    var nl = JSDOC.Lang.newline.names;
    var pc = JSDOC.Lang.puncChars;

    var ch1, ch2, ch3, ch4, last;
	var tokens = [];
	/**@ignore*/ tokens.last = function() {
        return tokens[tokens.length - 1];
    };

	while (!this.eof()) {
        ch1 = this.look();
        // identifier
        if (ch1.isAlpha() || ch1 === '_' || ch1 === '$') {
            this.read_word(tokens);
            continue;
        }
        // string
        if (ch1 === '"') {
            this.read_dbquote(tokens);
            continue;
        }
        if (ch1 === "'") {
            this.read_snquote(tokens);
            continue;
        }
        // space
        if (ws[ch1]) {
            this.read_space(tokens);
            continue;
        }
        // newline
        if (nl[ch1]) {
            this.read_newline(tokens);
            continue;
        }
        // number
        if (ch1.isDigit()) {
            this.read_numb(tokens);
            continue;
        }

        ch2 = this.look(1);
        // comment, div or regexp
        if (ch1 === '/') {
            if (ch2 === '*') {
                this.read_mlcomment(tokens);
                continue;
            }
            else if (ch2 === '/') {
                this.read_slcomment(tokens, 2);
                continue;
            }
            else {
                last = tokens.last();
                if (!last || (!last.is("NUMB") && !last.is("NAME") && !last.is("RIGHT_PAREN") && !last.is("RIGHT_BRACKET"))) {
                    this.read_regx(tokens);
                    continue;
                }
                else {
                    this.read_punc(tokens);
                    continue;
                }
            }
        }
        if (ch1 === '<' && ch2 === '!') {
            ch3 = this.look(2);
            ch4 = this.look(3);
            if (ch3 === '-' && ch4 === '-') {
                this.read_slcomment(tokens, 4);
                continue;
            }
        }
        if (pc.indexOf(ch1) >= 0) {
            this.read_punc(tokens);
            continue;
        }

		// if execution reaches here then an error has happened
		tokens.push(new JSDOC.Token(this.next(), "TOKN", "UNKNOWN_TOKEN"));
	}
    return tokens;
};

JSDOC.TokenReader.prototype.read_word = function (tokens) {
    var start = this.cursor;
    this.cursor += 1;

    function isWordChar(ch) {
        return ch.isAlpha() || ch === '.' || ch === '_' || ch === '$';
    }

    while (!this.eof() && isWordChar(this.look())) {
		this.cursor += 1;
	}

    var found = this.text.substring(start, this.cursor);
    var name = JSDOC.Lang.keyword.names[found];
    if (name) {
        tokens.push(new JSDOC.Token(found, "KEYW", name));
    }
    else {
        tokens.push(new JSDOC.Token(found, "NAME", "NAME"));
    }
};

JSDOC.TokenReader.prototype.read_punc = function (tokens) {
    var punc = JSDOC.Lang.punc.names;
	var found = this.next();

	while (!this.eof() && punc[found + this.look()]) {
		found += this.next();
	}

	tokens.push(new JSDOC.Token(found, "PUNC", punc[found]));
};

JSDOC.TokenReader.prototype.read_space = function (tokens) {
    var ws = JSDOC.Lang.whitespace.names;
	var start = this.cursor;
    this.cursor += 1;

    while (!this.eof() && ws[this.look()]) {
		this.cursor += 1;
	}

    var found = this.text.substring(start, this.cursor);
    if (this.collapseWhite) {
        found = " ";
    }
    if (this.keepWhite) {
        tokens.push(new JSDOC.Token(found, "WHIT", "SPACE"));
    }
};

JSDOC.TokenReader.prototype.read_newline = function (tokens) {
    var newline = JSDOC.Lang.newline.names;
	var start = this.cursor;
    this.cursor += 1;

	while (!this.eof() && newline[this.look()]) {
		this.cursor += 1;
	}
	
    var found = this.text.substring(start, this.cursor);
    if (this.collapseWhite) {
        found = "\n";
    }
    if (this.keepWhite) {
        tokens.push(new JSDOC.Token(found, "WHIT", "NEWLINE"));
    }
};

JSDOC.TokenReader.prototype.read_mlcomment = function (tokens) {
    var start = this.cursor;
    this.cursor += 2;

    var next = this.look(), pen = '', last = '';
    while (!this.eof() && !(last === "/" && pen === "*")) {
        pen = last;
        last = next;
        this.cursor += 1;
        next = this.look();
    }

    var found = this.text.substring(start, this.cursor);
    // to start doclet we allow /** or /*** but not /**/ or /****
    if (this.keepDocs && /^\/\*\*([^\/]|\*[^*])/.test(found)) {
        tokens.push(new JSDOC.Token(found, "COMM", "JSDOC"));
    }
    else if (this.keepComments) {
        tokens.push(new JSDOC.Token(found, "COMM", "MULTI_LINE_COMM"));
    }
};

JSDOC.TokenReader.prototype.read_slcomment = function (tokens, offset) {
    var nl = JSDOC.Lang.newline.names;
	var start = this.cursor;
    this.cursor += offset;

    while (!this.eof() && !nl[this.look()]) {
		this.cursor += 1;
	}
		
	if (this.keepComments) {
		tokens.push(new JSDOC.Token(this.text.substring(start, this.cursor), "COMM", "SINGLE_LINE_COMM"));
	}
};

/**
	@returns {Boolean} Was the token found?
 */
JSDOC.TokenReader.prototype.read_dbquote = function (tokens) {
    var nl = JSDOC.Lang.newline.names;
    var start = this.cursor;
    this.cursor += 1;

    while (!this.eof()) {
        if (this.look() === "\\") {
            if (nl[this.look(1)]) {
                do {
                    this.cursor += 1;
                } while (!this.eof() && nl[this.look()]);
            }
            else {
                this.cursor += 2;
            }
        }
        else if (this.look() === '"') {
            this.cursor += 1;
            tokens.push(new JSDOC.Token(this.text.substring(start, this.cursor), "STRN", "DOUBLE_QUOTE"));
            return;
        }
        else {
            this.cursor += 1;
        }
    }
    // error! unterminated string
    tokens.push(new JSDOC.Token(this.text.substring(start), "STRN", "DOUBLE_QUOTE"));
};

/**
	@returns {Boolean} Was the token found?
 */
JSDOC.TokenReader.prototype.read_snquote = function (tokens) {
    var start = this.cursor;
    this.cursor += 1;

    while (!this.eof()) {
        if (this.look() === "\\") { // escape sequence
            this.cursor += 2;
        }
        else if (this.look() === "'") {
            this.cursor += 1;
            tokens.push(new JSDOC.Token(this.text.substring(start, this.cursor), "STRN", "SINGLE_QUOTE"));
            return;
        }
        else {
            this.cursor += 1;
        }
    }
    // error! unterminated string
    tokens.push(new JSDOC.Token(this.text.substring(start), "STRN", "SINGLE_QUOTE"));
};

/**
	@returns {Boolean} Was the token found?
 */
JSDOC.TokenReader.prototype.read_numb = function (tokens) {
	if (this.look() === "0" && this.look(1) === "x") {
		this.read_hex(tokens);
        return;
    }
	
    var nexp = JSDOC.Lang.numberExp;
	var found = this.next();
	while (!this.eof() && nexp.test(found + this.look())) {
		found += this.next();
	}
	
    if (/^0[0-7]/.test(found)) {
        tokens.push(new JSDOC.Token(found, "NUMB", "OCTAL"));
    }
    else {
        tokens.push(new JSDOC.Token(found, "NUMB", "DECIMAL"));
    }
};

/*t:
	requires("../lib/JSDOC/TextStream.js");
	requires("../lib/JSDOC/Token.js");
	requires("../lib/JSDOC/Lang.js");
	
	plan(3, "testing JSDOC.TokenReader.prototype.read_numb");
	
	//// setup
	var src = "function foo(num){while (num+8.0 >= 0x20 && num < 0777){}}";
	var tr = new JSDOC.TokenReader();
	var tokens = tr.tokenize(new JSDOC.TextStream(src));
	
	var hexToken, octToken, decToken;
	for (var i = 0; i < tokens.length; i++) {
		if (tokens[i].name == "HEX_DEC") hexToken = tokens[i];
		if (tokens[i].name == "OCTAL") octToken = tokens[i];
		if (tokens[i].name == "DECIMAL") decToken = tokens[i];
	}
	////
	
	is(decToken.data, "8.0", "decimal number is found in source.");
	is(hexToken.data, "0x20", "hexdec number is found in source (issue #99).");
	is(octToken.data, "0777", "octal number is found in source.");
*/

/**
	@returns {Boolean} Was the token found?
 */
JSDOC.TokenReader.prototype.read_hex = function (tokens) {
    var nexp = JSDOC.Lang.hexDecExp;
	var found = this.next() + this.next();

	while (!this.eof()) {
		if (nexp.test(found) && !nexp.test(found + this.look())) { // done
			tokens.push(new JSDOC.Token(found, "NUMB", "HEX_DEC"));
			return;
		}
		else {
			found += this.next();
		}
	}
    tokens.push(new JSDOC.Token(found, "NUMB", "HEX_DEC"));
};

/**
	@returns {Boolean} Was the token found?
 */
JSDOC.TokenReader.prototype.read_regx = function (tokens) {
    var start = this.cursor;
    this.cursor += 1;

    while (!this.eof()) {
        if (this.look() === "\\") { // escape sequence
            this.cursor += 2;
        }
        else if (this.look() === "/") {
            this.cursor += 1;

            while (/[gmi]/.test(this.look())) {
                this.cursor += 1;
            }

            tokens.push(new JSDOC.Token(this.text.substring(start, this.cursor), "REGX", "REGX"));
            return;
        }
        else {
            this.cursor += 1;
        }
    }
    // error: unterminated regex
    tokens.push(new JSDOC.Token(this.text.substring(start), "REGX", "REGX"));
};