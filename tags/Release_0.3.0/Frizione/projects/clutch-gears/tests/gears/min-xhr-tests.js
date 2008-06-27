
if(!this.clutch){clutch={};}
clutch.isGearsInstalled=function(){if(window){return window.google&&google&&google.gears;}
else{return google&&google.gears;}};clutch.gearsFactory=function(){return google.gears.factory;};clutch.createGearsDatabase=function(){return google.gears.factory.create('beta.database');};clutch.createGearsDesktop=function(){return google.gears.factory.create('beta.desktop');};clutch.createGearsHttpRequest=function(){return google.gears.factory.create('beta.httprequest');};clutch.createGearsLocalServer=function(){return google.gears.factory.create('beta.localserver');};clutch.createGearsTimer=function(){return google.gears.factory.create('beta.timer');};clutch.createGearsWorkerPool=function(){return google.gears.factory.create('beta.workerpool');};if(!this.clutch){clutch={};}
if(!this.clutch.timer){clutch.timer={};}
(function(){var gearsTimer=null;if(window&&window.setTimeout){clutch.timer.setTimeout=function(code,millis){return window.setTimeout(code,millis);};clutch.timer.setInterval=function(code,millis){return window.setInterval(code,millis);};clutch.timer.clearTimeout=function(timerId){window.clearTimeout(timerId);};}
else{gearsTimer=clutch.createGearsTimer();clutch.timer.setTimeout=function(code,millis){return gearsTimer.setTimeout(code,millis);};clutch.timer.setInterval=function(code,millis){return gearsTimer.setInterval(code,millis);};clutch.timer.clearTimeout=function(timerId){gearsTimer.clearTimeout(timerId);};}})();if(!this.clutch){clutch={};}
if(!this.clutch.xhr){clutch.xhr={};}
clutch.xhr.createRequest=function(){try{return clutch.createGearsHttpRequest();}
catch(e){try{return new XMLHttpRequest();}
catch(e1){try{return new ActiveXObject("Msxml2.XMLHTTP");}
catch(e2){try{return new ActiveXObject("Microsoft.XMLHTTP");}
catch(e3){}}}}
return null;};clutch.xhr.executeRequest=function(method,url,optionalParams,optionalBody,timeout,handler){var requestTimeout=timeout||5000;var request=clutch.xhr.createRequest();var terminated=false;var timerId=clutch.timer.setTimeout(function(){terminated=true;if(request){request.abort();request=null;}
handler(-1,"Timeout","Timeout");},requestTimeout);var param;var qmark="?";if(optionalParams){for(param in optionalParams){if(optionalParams.hasOwnProperty(param)){url+=qmark+param+"="+optionalParams[param];qmark="";}}}
try{request.onreadystatechange=function(){if(terminated){return;}
try{if(request.readyState===4){var status,statusText,responseText;try{status=request.status;statusText=request.statusText;responseText=request.responseText;}
catch(e1){}
terminated=true;request=null;clutch.timer.clearTimeout(timerId);if(status===0){status=200;}
handler(status,statusText,responseText);}}
catch(e2){throw e2;}};request.open(method,url,true);request.send(optionalBody||null);return function(){if(request){terminated=true;request.abort();request=null;clutch.timer.clearTimeout(timerId);}
handler(-1,"Aborted","Aborted");};}
catch(e){terminated=true;request=null;clutch.timer.clearTimeout(timerId);clutch.timer.setTimeout(handler,0);return function(){};}};function createXhrTests(){return clutch.test.unit('XHR Tests',{clutchTests:[{func:'validUrl',callbacks:['validUrlHandler']},{func:'invalidUrl',callbacks:['invalidUrlHandler']},{func:'abortedRequest',callbacks:['abortedRequestHandler']}],validUrl:function(){var abort=clutch.xhr.executeRequest("GET",'/projects/clutch/src/tests/gears/xhr-test-data.json',null,null,2000,this.validUrlHandler);this.checkAbort(abort);},validUrlHandler:function(status,statusText,responseText){this.assert(status>=200&&status<=299,"Status not between 200 and 299");},invalidUrl:function(){var abort=clutch.xhr.executeRequest("GET",'/projects/clutch/src/tests/gears/invalid-url.json',null,null,250,this.invalidUrlHandler);this.checkAbort(abort);},invalidUrlHandler:function(status,statusText,responseText){this.assert(status>=400&&status<=499,"Status not between 400 and 499");},abortedRequest:function(){var abort=clutch.xhr.executeRequest("GET",'/projects/clutch/src/tests/gears/invalid-url.json',null,null,2000,this.abortedRequestHandler);this.checkAbort(abort);abort();},abortedRequestHandler:function(status,statusText,responseText){this.assert(status===-1,"Status not -1");this.assert(statusText==='Aborted',"Status text not 'Aborted'");this.assert(responseText==='Aborted',"Response text not 'Aborted'");},checkAbort:function(abort){this.assert(abort!==null,"Returned value is null");this.assert(typeof abort==='function',"Returned value is not a function");}},5000);}
function runClutchTests(){return createXhrTests();}