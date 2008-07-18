(function(){if(window.google&&google.gears){return ;}var factory=null;if(typeof GearsFactory!="undefined"){factory=new GearsFactory();}else{try{factory=new ActiveXObject("Gears.Factory");if(factory.getBuildInfo().indexOf("ie_mobile")!=-1){factory.privateSetGlobalObject(this);}}catch(e){if((typeof navigator.mimeTypes!="undefined")&&navigator.mimeTypes["application/x-googlegears"]){factory=document.createElement("object");factory.style.display="none";factory.width=0;factory.height=0;factory.type="application/x-googlegears";document.documentElement.appendChild(factory);}}}if(!factory){return ;}if(!window.google){google={};}if(!google.gears){google.gears={factory:factory};}})();if(!this.JSON){JSON=function(){function f(n){return n<10?"0"+n:n;}Date.prototype.toJSON=function(key){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";};var cx=new RegExp("[\\u0000\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]","g"),escapeable=new RegExp('[\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]',"g"),gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapeable.lastIndex=0;return escapeable.test(string)?'"'+string.replace(escapeable,function(a){var c=meta[a];if(typeof c==="string"){return c;}return"\\u"+("0000"+(+(a.charCodeAt(0))).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key);}if(typeof rep==="function"){value=rep.call(holder,key,value);}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null";}gap+=indent;partial=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null";}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v;}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value,rep);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value,rep);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v;}}return{stringify:function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" ";}}else{if(typeof space==="string"){indent=space;}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify");}return str("",{"":value});},parse:function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+(+(a.charCodeAt(0))).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=new Function("return ("+text+");")();return typeof reviver==="function"?walk({"":j},""):j;}throw new SyntaxError("JSON.parse");}};}();}if(!this.clutch){clutch={};}if(!this.clutch.test){clutch.test={};}clutch.test.executeRequest=function(method,url,optionalParams,optionalBody,timeout,handler){var requestTimeout=timeout||5000;function createRequest(){try{return new XMLHttpRequest();}catch(e1){try{return new ActiveXObject("Msxml2.XMLHTTP");}catch(e2){try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(e3){}}}return null;}var request=createRequest();var terminated=false;var requestTimerId=window.setTimeout(function(){terminated=true;handler(-1,"Timeout","");},requestTimeout);var param=null;var qmark="?";if(optionalParams){for(param in optionalParams){if(optionalParams.hasOwnProperty(param)){url+=qmark+param+"="+optionalParams[param];qmark="";}}}try{request.onreadystatechange=function(){if(terminated){return ;}try{if(request.readyState===4){var status,statusText,responseText;try{status=request.status;statusText=request.statusText;responseText=request.responseText;}catch(e1){}terminated=true;window.clearTimeout(requestTimerId);if(status===0){status=200;}handler(status,statusText,responseText);}}catch(e2){throw e2;}};request.open(method,url,true);if(optionalBody){request.setRequestHeader("Content-Length",optionalBody.length);}request.send(optionalBody||null);}catch(e){terminated=true;request=null;window.clearTimeout(requestTimerId);window.setTimeout(handler,0);}};if(!this.clutch){clutch={};}if(!this.clutch.test){clutch.test={};}clutch.test.utils={createTotaliser:function(){return{complete:false,tests:0,logs:0,failures:0,errors:0,time:0,abend:null,messages:[]};},sumTotaliser:function(from,to){to.tests+=from.tests;to.logs+=from.logs;to.failures+=from.failures;to.errors+=from.errors;to.time+=from.time;},addTotaliserProperties:function(totaliser,name,testObject,func,callback,callbacks){totaliser.name=name;totaliser.testObject=testObject;totaliser.func=func;totaliser.callback=callback;totaliser.callbacks=callbacks;},removeTotaliserProperties:function(totaliser){delete totaliser.complete;delete totaliser.name;delete totaliser.testObject;delete totaliser.callbacks;},createProfile:function(){return{complete:false,index:0,total:0,abend:null,tests:[]};}};clutch.test.assertions=function(totaliser){var assertions={log:function(message){totaliser.logs+=1;totaliser.messages.push({type:"log",message:message});},pass:function(){totaliser.tests+=1;},fail:function(message){totaliser.tests+=1;totaliser.failures+=1;totaliser.messages.push({type:"fail",message:message});},error:function(error){totaliser.tests+=1;totaliser.errors+=1;var message=error.name+": "+error.message;if(error.filename&&error.lineNumber&&error.stack){message=error.filename+"("+error.lineNumber+") "+message+"\n"+error.stack;}else{if(error.filename&&error.lineNumber){message=error.filename+"("+error.lineNumber+") "+message;}}totaliser.messages.push({type:"error",message:message});},assert:function(condition,message){try{if(condition){assertions.pass();}else{message=message||"assert: "+condition;assertions.fail(message);}}catch(e){assertions.error(e);}}};return assertions;};clutch.test.runner=function(profile,timeout){var gearsTimer=null;var timerId=null;var setTestTimeout=null;var clearTestTimeout=null;var functionAssertions=null;var callbackAssertions=null;var callbacks=null;(function(){if(!!this.window&&!!this.window.setTimeout){setTestTimeout=function(code,millis){return window.setTimeout(code,millis);};clearTestTimeout=function(timerId){window.clearTimeout(timerId);};}else{gearsTimer=clutch.createGearsTimer();setTestTimeout=function(code,millis){return gearsTimer.setTimeout(code,millis);};clearTestTimeout=function(timerId){gearsTimer.clearTimeout(timerId);};}})();function cleanUp(){var i=0;var total=profile.total;var removeProps=clutch.test.utils.removeTotaliserProperties;for(;i<total;i+=1){removeProps(profile.tests[i]);}}function abend(reason){if(timerId){clearTestTimeout(timerId);}reason=reason||"Terminated by User";profile.abend=reason;var i=profile.index;var total=profile.total;for(;i<total;i+=1){profile.tests[i].abend=reason;}cleanUp();profile.index=profile.total;profile.complete=true;}function injectAssertions(testObject,assertions){var prop=null;for(prop in assertions){if(assertions.hasOwnProperty(prop)){testObject[prop]=assertions[prop];}}}function wrapCallback(testObject,callbackFunc,func,callbackIndex,index){return function(){var test=profile.tests[index];injectAssertions(testObject,callbackAssertions);test.func=callbackFunc+" <- "+func;test.callback=callbackFunc;var startAt=new Date().getTime();try{try{startAt=new Date().getTime();callbacks[callbackIndex].apply(testObject,arguments);}finally{test.time+=(new Date().getTime()-startAt);}}catch(e1){testObject.error(e1);try{testObject.tearDown();}catch(e2){testObject.error(e2);}}injectAssertions(testObject,functionAssertions);test.complete=true;};}function testFunctionAndCallbacks(test,next){var testObject=test.testObject;var callback=null;var length=test.callbacks.length;var i=0;var index=profile.index+1;callbackAssertions=clutch.test.assertions(profile.tests[index]);callbacks=[];for(;i<length;i+=1){callback=test.callbacks[i];callbacks.push(testObject[callback]);testObject[callback]=wrapCallback(testObject,callback,test.func,i,index);}function waitForCallback(){if(profile.complete){return ;}var testFunction=profile.tests[profile.index];var testCallback=profile.tests[profile.index+1];if(testCallback.complete){var testObject=testFunction.testObject;var length=testFunction.callbacks.length;var i=0;for(;i<length;i+=1){testObject[testFunction.callbacks[i]]=callbacks[i];}profile.index+=2;setTestTimeout(next,0);}else{setTestTimeout(waitForCallback,100);}}var startAt=new Date().getTime();try{try{testObject.setUp();startAt=new Date().getTime();testObject[test.func]();}finally{test.time+=(new Date().getTime()-startAt);}}catch(e1){testObject.error(e1);try{testObject.tearDown();}catch(e2){testObject.error(e2);}}setTestTimeout(waitForCallback,100);}function testFunction(test,next){var testObject=test.testObject;var startAt=new Date().getTime();try{try{testObject.setUp();startAt=new Date().getTime();testObject[test.func]();}finally{test.time+=(new Date().getTime()-startAt);testObject.tearDown();}}catch(e1){testObject.error(e1);}profile.index+=1;setTestTimeout(next,0);}function next(){if(profile.index>=profile.total){if(timerId){clearTestTimeout(timerId);}cleanUp();profile.complete=true;return ;}var test=profile.tests[profile.index];var testObject=test.testObject;functionAssertions=clutch.test.assertions(test);injectAssertions(testObject,functionAssertions);if(test.callbacks){testFunctionAndCallbacks(test,next);}else{testFunction(test,next);}}function timedOut(){abend("Testing timeout ("+timeout+" ms) expired");}var runner={run:function(){profile.complete=false;profile.index=0;profile.total=profile.tests.length;if(timeout>0){timerId=setTestTimeout(timedOut,timeout);}setTestTimeout(next,0);},abort:function(reason){abend(reason);},check:function(){return{complete:profile.complete,abend:profile.abend,index:profile.index,total:profile.total};}};return runner;};clutch.test.unit=function(name,testObject,timeout){var utils=clutch.test.utils;var profile=null;var tests=[];var runner=null;return{prepare:function(parentProfile){if(parentProfile){profile=parentProfile;}else{profile=utils.createProfile();}var i=null;var length=null;var testArray=null;var test=null;var prop=null;var totaliser=null;if(testObject.clutchTests){testArray=testObject.clutchTests;length=testArray.length;for(i=0;i<length;i+=1){test=testArray[i];totaliser=utils.createTotaliser();utils.addTotaliserProperties(totaliser,name,testObject,test.func,null,test.callbacks);profile.tests.push(totaliser);tests.push(totaliser);if(totaliser.callbacks){totaliser=utils.createTotaliser();utils.addTotaliserProperties(totaliser,name,testObject,"callback <- "+test.func,null,null);profile.tests.push(totaliser);tests.push(totaliser);}}}else{for(prop in testObject){if(testObject.hasOwnProperty(prop)&&typeof testObject[prop]==="function"&&prop.indexOf("test")===0){totaliser=utils.createTotaliser();utils.addTotaliserProperties(totaliser,name,testObject,prop,null,null);profile.tests.push(totaliser);tests.push(totaliser);}}}if(!testObject.setUp){testObject.setUp=function(){};}if(!testObject.tearDown){testObject.tearDown=function(){};}},run:function(){if(!profile){this.prepare();}runner=clutch.test.runner(profile,timeout);runner.run();},abort:function(){runner.abort();},check:function(){return runner.check();},summarise:function(){var results=[];var total=utils.createTotaliser();var length=tests.length;var test=null;var i=null;for(i=0;i<length;i+=1){test=tests[i];utils.sumTotaliser(test,total);results.push({name:test.func,summary:test});}utils.removeTotaliserProperties(total);return{name:name,abend:profile.abend,summary:total,tests:results};}};};clutch.test.group=function(arrayOfUnitTests,timeout){var utils=clutch.test.utils;var profile=null;var runner=null;return{prepare:function(){profile=utils.createProfile();var length=arrayOfUnitTests.length;var unitTest=null;var i=null;for(i=0;i<length;i+=1){unitTest=arrayOfUnitTests[i];unitTest.prepare(profile);}},run:function(){if(!profile){this.prepare();}runner=clutch.test.runner(profile,timeout);runner.run();},abort:function(){runner.abort();},check:function(){return runner.check();},summarise:function(){var total=utils.createTotaliser();var results=[];var length=arrayOfUnitTests.length;var unitTest=null;var unitSummary=null;var i=null;for(i=0;i<length;i+=1){unitTest=arrayOfUnitTests[i];unitSummary=unitTest.summarise();utils.sumTotaliser(unitSummary.summary,total);results.push(unitSummary);}utils.removeTotaliserProperties(total);return{abend:profile.abend,summary:total,tests:results};}};};if(!this.clutch){clutch={};}clutch.date={toClutchJSON:function(){function tens(n){return n<10?"0"+n:n;}function hundreds(n){return n<100?"0"+tens(n):n;}Date.prototype.toJSON=function(){return"\\/Date("+this.getUTCFullYear()+"-"+tens(this.getUTCMonth()+1)+"-"+tens(this.getUTCDate())+"T"+tens(this.getUTCHours())+":"+tens(this.getUTCMinutes())+":"+tens(this.getUTCSeconds())+"."+hundreds(this.getUTCMilliseconds())+"Z)\\/";};}};clutch.storeTests=function(testFunction,fixtureUrl,viewUrl){var date=new Date().toUTCString();var tests=testFunction();var intervalId=null;var element=document.getElementById("test-results");function handleRequest(status,statusText,responseText){if(status>=200&&status<=299){element.innerHTML="Unit tests <a href = '"+viewUrl+"'>completed</a> and stored.";}else{element.innerHTML="Couldn't store the unit test data. Status: "+status+" "+statusText;}}function checkTests(){var status=tests.check();if(status.complete){window.clearInterval(intervalId);element.innerHTML="Unit tests completed...";clutch.date.toClutchJSON();var summary=tests.summarise();summary.summary.date=date;clutch.test.executeRequest("POST",fixtureUrl,null,JSON.stringify(summary,null,"\t"),2000,handleRequest);return ;}element.innerHTML=""+status.index+" unit tests of "+status.total+" completed...";}intervalId=window.setInterval(checkTests,500);element.innerHTML="Running...";tests.run();};