/*
Copyright (c) 2008 John Leach

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

/*global app, req, res, crash, frizione*/

/**
 * JsDoc object constructor.
 *
 * @class JsDoc
 * @constructor
 * @param group the project/application/module object.
 */
function constructor(group) {
    app.debug('JsDoc: ' + group.type + ": " + group.name);
    this.group = group;
    this.explain = "Frizione will be ecstatic to generate documention using the following JavaScript files, though it might take a while:";
    this.typeName = "JavaScript";
    this.service = "jsdoc";
    this.serviceText = "JavaScript Doc";
    this.includes = [ ".jsdoc.js" ];
    this.excludes = null;
}

/**
 * Default (main) action for join operations.
 */
function main_action() {
    app.debug("JsDoc Request " + req.path);

    var path = req.path.split('/');
    if (path.length > 3) {
        var file = '/' + path.slice(3, path.length).join('/');
        this.renderJsDocPage(file);
    }
    else {
        if (req.data.action === "refresh") {
            app.debug("JsDoc Request refresh files list");
            this.group.refreshFiles();
        }
        frizione.macros.serviceMainPage(this);
    }
}

/**
 * Renders the JsDoc page.
 *
 * @param file the JsDoc file to execute.
 */
function renderJsDocPage(file) {
    var data = {};
    data.title = this.serviceText + " : " + this.group.name + " : " + frizione.qualifiedVersion();
    data.group = this.group;
    data.head = "./head.html";
    data.body = "./service/result.html";
    data.service = this.service;
    data.serviceText = this.serviceText;

    data.file = file;
    var text = frizione.service.join(this.group.prefix + '/' + this.group.dir + '/' + file);
    var params = frizione.service.parseJsDocParams(text);
    params.errors = frizione.service.checkJsDocParams(params);
    var args = [];
    var arg = null;    
app.debug("Start jsdoc " + req.runtime);
    if (!params.errors) {
        crash.logger.clear();

        for (arg in params) {
            if (params.hasOwnProperty(arg) && arg !== "src") {
                args.push('--' + arg + '=' + params[arg]);
            }
        }
        args = args.concat(params.src);
        var opt = Opt.get(args,
                {
                    // c: "conf",
                    // t: "template",
                    // r: "recurse",
                    // x: "ext",
                    p: "private",
                    a: "allfunctions",
                    e: "encoding",
                    n: "nocode",
                    // o: "out",
                    s: "suppress",
                    // T: "testmode",
                    // h: "help",
                    // v: "verbose",
                    // "D[]": "define",
                    // "H[]": "handler"
                    d: "directory"
                }
        );
        JSDOC.Parser.conf.ignoreCode = opt.n;

        var jsdoc = new JSDOC.JsDoc(opt);
        var template = opt.t || "frizione/third-party/jsdoc-toolkit/templates/jsdoc/";
        var handler = jsdoc.symbolSet.handler;
app.debug("Start publish " + req.runtime);
        if (handler && handler.publish) {
            handler.publish(jsdoc.symbolSet);
        }
        else {
            try {
                crash.load(template + "publish.js");
                if (!publish) {
                    params.errors = [];
                    params.errors.push("No publish() function is defined in template: " + template + "publish.js, so nothing to do.");
                }
                else {
                    publish(jsdoc.symbolSet, "/modules/" + template);
                }
            }
            catch(e) {
                params.errors = [];
                params.errors.push("Sorry, that doesn't seem to be a valid template: " + template + "publish.js : " + e);
            }
        }
    }
app.debug("End jsdoc " + req.runtime);

    var log = crash.logger.log;
    var messages = log.messages;
    var i = 0;
    var length = null;
    var errors = null;
    var message = null;
    if (log.errors > 0) {
        errors = params.errors || [];
        length = messages.length;
        for (i = 0; i < length; i += 1) {
            message = messages[i];
            if (message.type === 'error' || message.type === 'fatal') {
                errors.push(message.type + ": " + message.message);
            }
        }
        params.errors = errors;
    }
    if (log.warnings > 0) {
        var warnings = [];
        length = messages.length;
        for (i = 0; i < length; i += 1) {
            message = messages[i];
            if (message.type === 'warning') {
                warnings.push(message.type + ": " + message.message);
            }
        }
        params.warnings = warnings;
    }
    data.jsdocParams = params;
    data.reportTitle = frizione.macros.commandTitleReport('jsdoc', data);
    data.report = frizione.macros.commandReport('jsdoc', data);
    
    var resource = crash.resource("frizione/html/document.html");
    res.charset = "UTF-8";
    res.write(crash.st.load(resource, data, "UTF-8", '<', getProperty('debug') !== 'true'));
}

/**
 * Method used by Helma request path resolution.
 *
 * @param {String} name the path element name.
 * @return {Object} the object that handles the element.
 */
function getChildElement(name) {
    app.debug("JsDoc.getChildElement " + name);
    return this;
}