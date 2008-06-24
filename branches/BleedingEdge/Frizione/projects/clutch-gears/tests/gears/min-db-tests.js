
if(!this.clutch){clutch={};}
clutch.isGearsInstalled=function(){if(window){return window.google&&google&&google.gears;}
else{return google&&google.gears;}};clutch.gearsFactory=function(){return google.gears.factory;};clutch.createGearsDatabase=function(){return google.gears.factory.create('beta.database');};clutch.createGearsDesktop=function(){return google.gears.factory.create('beta.desktop');};clutch.createGearsHttpRequest=function(){return google.gears.factory.create('beta.httprequest');};clutch.createGearsLocalServer=function(){return google.gears.factory.create('beta.localserver');};clutch.createGearsTimer=function(){return google.gears.factory.create('beta.timer');};clutch.createGearsWorkerPool=function(){return google.gears.factory.create('beta.workerpool');};if(!this.clutch){clutch={};}
if(!this.clutch.db){clutch.db={};}
clutch.db.fromSingleRow=function(result,columns){if(!result.isValidRow()){result.close();return null;}
var i=0;var length=columns.length;var name=null;var value={};for(;i<length;i+=1){name=columns[i];value[name]=result.fieldByName(name);}
result.close();return value;};clutch.db.fromRows=function(result,columns){if(!result.isValidRow()){result.close();return null;}
var values=[];var i=0;var length=columns.length;var name=null;var value=null;while(result.isValidRow()){value={};values.push(value);for(;i<length;i+=1){name=columns[i];value[name]=result.fieldByName(name);}
result.next();}
result.close();return values;};clutch.db.optionalQuery=function(params){if(!params){return"";}
var query="";if(params.where){query=' WHERE '+params.where;}
if(params.groupBy){query+=' GROUP BY '+params.groupBy;}
if(params.having){query+=' HAVING '+params.having;}
if(params.orderBy){query+=' ORDER BY '+params.orderBy;}
if(params.limit){query+=' LIMIT '+params.limit;if(params.offset){query+=' OFFSET '+params.offset;}}
return query;};if(!this.clutch){clutch={};}
if(!this.clutch.db){clutch.db={};}
clutch.db.logger=function(name){var columns=['id','name','value'];var db=clutch.createGearsDatabase();db.open(name);db.execute('CREATE TABLE IF NOT EXISTS clutch_logger'+' ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT(256), value TEXT(4096) )');return{log:function(name,value){var result=db.execute('INSERT INTO clutch_logger (name, value) VALUES(?, ?)',[name,value]);result.close();return db.rowsAffected;},get:function(id){var result=db.execute('SELECT id, name, value FROM clutch_logger WHERE id = ?',[id]);return clutch.db.fromSingleRow(result,columns);},list:function(params){var query=clutch.db.optionalQuery(params);var result=db.execute('SELECT id, name, value FROM clutch_logger'+query);return clutch.db.fromRows(result,columns);},remove:function(id){var result=db.execute('DELETE FROM clutch_logger WHERE id = ?',[id]);result.close();return db.rowsAffected;},removeAll:function(){var result=db.execute('DELETE FROM clutch_logger WHERE 1');result.close();return db.rowsAffected;}};};function createDatabaseTests(){return clutch.test.unit('Database Tests',{clutchTests:[{func:'clearDatabase',callbacks:null}],clearDatabase:function(){var logger=clutch.db.logger('clutch_gears');logger.removeAll();var rows=logger.list();this.assert(rows===null,"Logger database should have no rows");}},10000);}
function runClutchTests(){return createDatabaseTests();}