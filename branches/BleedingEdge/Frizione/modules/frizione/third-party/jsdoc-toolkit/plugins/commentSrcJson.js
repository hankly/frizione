/*jslint evil: true */
/*globals JSDOC */

JSDOC.PluginManager.registerPlugin(
	"JSDOC.commentSrcJson",
	{
		onDocCommentSrc: function(commentSrc) {
			var json;
			if (/^\s*@json\b/.test(commentSrc)) {
				commentSrc = commentSrc.replace("@json", "");
				eval("json = "+commentSrc);
				var tagged = "";
				for (var i in json) {
					if (json.hasOwnProperty(i)) {
                        var tag = json[i];
                        // todo handle cases where tag is an object
                        tagged += "@"+i+" "+tag+"\n";
                    }
                }
				return tagged;
			}
		}
	}
);