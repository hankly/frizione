/*globals JSDOC */

/**
	@namespace
*/
JSDOC.Lang = {
};

JSDOC.Lang.isBuiltin = function(name) {
	return (JSDOC.Lang.isBuiltin.coreObjects.indexOf(name) > -1);
};
JSDOC.Lang.isBuiltin.coreObjects = ['_global_', 'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object', 'RegExp', 'String'];

JSDOC.Lang.whitespace = function(ch) {
	return JSDOC.Lang.whitespace.names[ch];
};
JSDOC.Lang.whitespace.names = {
	" ":      "SPACE",
	"\f":     "FORMFEED",
	"\t":     "TAB",
	"\u0009": "UNICODE_TAB",
	"\u000A": "UNICODE_NBR",
	"\u0008": "VERTICAL_TAB"
};

JSDOC.Lang.newline = function(ch) {
	return JSDOC.Lang.newline.names[ch];
};
JSDOC.Lang.newline.names = {
	"\n":     "NEWLINE",
	"\r":     "RETURN",
	"\u000A": "UNICODE_LF",
	"\u000D": "UNICODE_CR",
	"\u2029": "UNICODE_PS",
	"\u2028": "UNICODE_LS"
};

JSDOC.Lang.keyword = function(word) {
	return JSDOC.Lang.keyword.names[word];
};
JSDOC.Lang.keyword.names = {
	"break":      "BREAK",
	"case":       "CASE",
	"catch":      "CATCH",
	"const":      "VAR",
	"continue":   "CONTINUE",
	"default":    "DEFAULT",
	"delete":     "DELETE",
	"do":         "DO",
	"else":       "ELSE",
	"false":      "FALSE",
	"finally":    "FINALLY",
	"for":        "FOR",
	"function":   "FUNCTION",
	"if":         "IF",
	"in":         "IN",
	"instanceof": "INSTANCEOF",
	"new":        "NEW",
	"null":       "NULL",
	"return":     "RETURN",
	"switch":     "SWITCH",
	"this":       "THIS",
	"throw":      "THROW",
	"true":       "TRUE",
	"try":        "TRY",
	"typeof":     "TYPEOF",
	"void":       "VOID",
	"while":      "WHILE",
	"with":       "WITH",
	"var":        "VAR"
};

JSDOC.Lang.punc = function(ch) {
	return JSDOC.Lang.punc.names[ch];
};
JSDOC.Lang.puncChars = ";,?:|^&=!<>+-*/%~.[]{}()";
JSDOC.Lang.punc.names = {
	";":   "SEMICOLON",
	",":   "COMMA",
	"?":   "HOOK",
	":":   "COLON",
	"||":  "OR", 
	"&&":  "AND",
	"|":   "BITWISE_OR",
	"^":   "BITWISE_XOR",
	"&":   "BITWISE_AND",
	"===": "STRICT_EQ", 
	"==":  "EQ",
	"=":   "ASSIGN",
	"!==": "STRICT_NE",
	"!=":  "NE",
	"<<":  "LSH",
	"<=":  "LE", 
	"<":   "LT",
	">>>": "URSH",
	">>":  "RSH",
	">=":  "GE",
	">":   "GT", 
	"++":  "INCREMENT",
	"--":  "DECREMENT",
	"+":   "PLUS",
	"-":   "MINUS",
	"*":   "MUL",
	"/":   "DIV", 
	"%":   "MOD",
	"!":   "NOT",
	"~":   "BITWISE_NOT",
	".":   "DOT",
	"[":   "LEFT_BRACKET",
	"]":   "RIGHT_BRACKET",
	"{":   "LEFT_CURLY",
	"}":   "RIGHT_CURLY",
	"(":   "LEFT_PAREN",
	")":   "RIGHT_PAREN"
};

JSDOC.Lang.matching = function(name) {
	return JSDOC.Lang.matching.names[name];
};
JSDOC.Lang.matching.names = {
	"LEFT_PAREN": "RIGHT_PAREN",
	"RIGHT_PAREN": "LEFT_PAREN",
	"LEFT_CURLY": "RIGHT_CURLY",
	"RIGHT_CURLY": "LEFT_CURLY",
	"LEFT_BRACE": "RIGHT_BRACE",
	"RIGHT_BRACE": "LEFT_BRACE"
};

JSDOC.Lang.isNumber = function(str) {
	return JSDOC.Lang.numberExp.test(str);
};
JSDOC.Lang.numberExp = /^(\.[0-9]|[0-9]+\.|[0-9])[0-9]*([eE][+\-][0-9]+)?$/i;

JSDOC.Lang.isHexDec = function(str) {
	return JSDOC.Lang.hexDecExp.test(str);
};
JSDOC.Lang.hexDecExp = /^0x[0-9A-F]+$/i;

JSDOC.Lang.isWordChar = function(str) {
	return JSDOC.Lang.wordCharExp.test(str);
};
JSDOC.Lang.wordCharExp = /^[a-zA-Z0-9$_.]+$/;

JSDOC.Lang.isSpace = function(str) {
	return (typeof JSDOC.Lang.whitespace(str) !== "undefined");
};

JSDOC.Lang.isNewline = function(str) {
	return (typeof JSDOC.Lang.newline(str) !== "undefined");
};