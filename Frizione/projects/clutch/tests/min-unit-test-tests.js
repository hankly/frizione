
if(!this.clutch){clutch={};}
clutch.date={toStandardJSON:function(){function tens(n){return n<10?'0'+n:n;}
function hundreds(n){return n<100?'0'+tens(n):n;}
Date.prototype.toJSON=function(){return this.getUTCFullYear()+'-'+
tens(this.getUTCMonth()+1)+'-'+
tens(this.getUTCDate())+'T'+
tens(this.getUTCHours())+':'+
tens(this.getUTCMinutes())+':'+
tens(this.getUTCSeconds())+'.'+
hundreds(this.getUTCMilliseconds())+'Z';};},toMicrosoftJSON:function(){Date.prototype.toJSON=function(){return"\\/Date("+this.getTime()+")\\/";};},toClutchJSON:function(){function tens(n){return n<10?'0'+n:n;}
function hundreds(n){return n<100?'0'+tens(n):n;}
Date.prototype.toJSON=function(){return"\\/Date("+
this.getUTCFullYear()+'-'+
tens(this.getUTCMonth()+1)+'-'+
tens(this.getUTCDate())+'T'+
tens(this.getUTCHours())+':'+
tens(this.getUTCMinutes())+':'+
tens(this.getUTCSeconds())+'.'+
hundreds(this.getUTCMilliseconds())+'Z'+")\\/";};},evalJSON:function(){if(String.prototype.evalJSON&&typeof String.prototype.evalJSON==='function'){var microsoftDate=new RegExp("^\\\\\\/Date\\((\\d+)\\)\\\\\\/$","gm");var clutchDate=new RegExp("^\\\\\\/Date\\((\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(\\.\\d+)?Z\\)\\\\\\/$","gm");String.prototype.evalJSON=function(sanitize){var json=this.unfilterJSON();try{if(!sanitize||json.isJSON()){json=json.replace(microsoftDate,function(str,p1,offset,s){return"new Date("+p1+")";});json=json.replace(clutchDate,function(str,p1,p2,p3,p4,p5,p6,p7,offset,s){var millis=p7||".0";millis=millis.slice(1);return"new Date(Date.UTC("+(+p1)+", "+(+p2-1)+", "+(+p3)+", "+(+p4)+", "+(+p5)+", "+(+p6)+", "+(+millis)+"))";});return new Function('return ('+json+');')();}}catch(e){}
throw new SyntaxError('Badly formed JSON string: '+this.inspect());};}}};clutch.string={trim:function(string){return string.replace(/^[\s\u00a0]+/,'').replace(/[\s\u00a0]+$/,'');},startsWith:function(string,match){return string.indexOf(match)===0;},endsWith:function(string,match){var offset=string.length-match.length;return offset>=0&&string.lastIndexOf(match)===offset;},toJSON:function(object){if(Object.toJSON&&typeof Object.toJSON==='function'){return Object.toJSON(object);}
else{return JSON.stringify(object);}},fromJSON:function(string){if(String.prototype.evalJSON&&typeof String.prototype.evalJSON==='function'){return string.evalJSON(true);}
else{var microsoftDate=new RegExp("^\\\\\\/Date\\((\\d+)\\)\\\\\\/$","gm");var clutchDate=new RegExp("^\\\\\\/Date\\((\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})(\\.\\d+)?Z\\)\\\\\\/$","gm");return JSON.parse(string,function(key,value){var match,millis;if(typeof value==='string'){match=microsoftDate.exec(value);if(match){return new Date(+match[1]);}
else{match=clutchDate.exec(value);if(match){millis=match[7]||".0";millis=match[7].slice(1);return new Date(Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+match[6],+millis));}}}
return value;});}},messagePack:function(message,arg){if(arg===null||typeof arg==='undefined'){return message;}
if(arg instanceof String||typeof arg==='string'){return message+" "+arg;}
if(arg instanceof Array||typeof arg==='object'){return message+'.json '+clutch.string.toJSON(arg);}
return message+" "+arg.toString();},messageUnpack:function(message){var parts=message.match(/\s?(\S+)\s+(.+)/);if(parts===null||parts.length===1){return{message:message,arg:null};}
var command=parts[1];if(this.endsWith(command,'.json')){command=command.substring(0,command.length-5);return{message:command,arg:clutch.string.fromJSON(parts[2])};}
return{message:command,arg:parts[2]};}};function createUnitTests(){return clutch.unittest('Assertion Tests',{testPass:function(){this.pass();this.assert(true===true);},testFail:function(){this.fail("Test fail() call");this.assert(true===false,"assert(false) guaranteed to fail");},testError:function(){this.error(new Error("Test error() call"));},testAssert:function(){this.assert(true===true,"assert(true) shouldn't fail");}});}
function runClutchTests(){return createUnitTests();}