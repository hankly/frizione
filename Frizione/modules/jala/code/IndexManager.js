//
// Jala Project [http://opensvn.csie.org/traccgi/jala]
//
// Copyright 2004 ORF Online und Teletext GmbH
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision: 310 $
// $LastChangedBy: robert $
// $LastChangedDate: 2007-11-09 11:45:18 +0100 (Fre, 09 Nov 2007) $
// $HeadURL: http://dev.orf.at/source/jala/trunk/code/IndexManager.js $
//


/**
 * @fileoverview Fields and methods of the jala.IndexManager class.
 */


// Define the global namespace for Jala modules
if (!global.jala) {
   global.jala = {};
}


/**
 * HelmaLib dependencies
 */
app.addRepository("modules/helma/Search.js");
app.addRepository("modules/helma/File.js");

/**
 * Constructs a new IndexManager object.
 * @class This class basically sits on top of a helma.Search.Index instance
 * and provides methods for adding, removing and optimizing the underlying index.
 * All methods generate jobs that are put into an internal queue which is
 * processed asynchronously by a separate worker thread. This means all calls
 * to add(), remove() and optimize() will return immediately, but the changes to
 * the index will be done within a short delay. Please keep in mind to change the
 * status of this IndexManager instance to REBUILDING before starting to rebuild
 * the index, as this ensures that all add/remove/optimize jobs will stay in the
 * queue and will only be processed after switching the status back to NORMAL.
 * This ensures that objects that have been modified during a rebuilding process
 * are re-indexed properly afterwards.
 * @param {String} name The name of the index, which is the name of the directory
 * the index already resides or will be created in.
 * @param {helma.File} dir The base directory where this index's directory
 * is already existing or will be created in.
 * @param {String} lang The language of the documents in this index. This leads
 * to the proper Lucene analyzer being used for indexing documents.
 * @constructor
 * @see helma.Search.createIndex
 */
jala.IndexManager = function IndexManager(name, dir, lang) {

   /**
    * Private variable containing the worker thread
    * @private
    */
   var thread = null;

   /**
    * Private flag indicating that the worker thread should stop
    * @type Boolean
    * @private
    */
   var interrupted = false;

   /**
    * Private variable containing the index managed by
    * this IndexManager instance.
    * @private 
    */
   var index = null;

   /**
    * Private variable containing a status indicator.
    * @type Number
    * @private
    */
   var status = jala.IndexManager.NORMAL;

   /**
    * Synchronized linked list that functions as a queue for
    * asynchronous processing of index manipulation jobs.
    * @type java.util.LinkedList
    * @private
    * @see jala.IndexManager.Job
    */
   var queue = java.util.Collections.synchronizedList(new java.util.LinkedList());

   /**
    * The name of the unique identifier field in the index. Defaults to "id".
    * @type String
    * @private
    */
   var idFieldname = "id";

   /**
    * Returns the underlying index.
    * @returns The index this queue is working on.
    * @type helma.Search.Index
    */
   this.getIndex = function() {
      return index;
   };

   /**
    * Returns the status of this manager.
    * @returns The status of this index manager.
    * @type Number
    * @see #NORMAL
    * @see #REBUILDING
    */
   this.getStatus = function() {
      return status;
   };

   /**
    * Modifies the status of this manager, which has implications
    * on how index modifying jobs are handled. If the status
    * is {@link #REBUILDING}, all jobs are queued until the status
    * is set back to {@link #NORMAL}.
    * @param {Number} s The new status of this manager.
    * @see #NORMAL
    * @see #REBUILDING
    */
   this.setStatus = function(s) {
      status = s;
      return;
   };

   /**
    * Returns the queue this index manager is using.
    * @returns The queue.
    * @type java.util.LinkedList
    */
   this.getQueue = function() {
      return queue;
   };

   /**
    * Returns the name of the index manger, which
    * is equal to the name of the underlying index
    * @returns The name of the index manager
    * @type String
    */
   this.getName = function() {
      return name;
   };

   /**
    * Returns the name of the field containing the unique identifier
    * of document objects in the index wrapped by this IndexManager.
    * Defaults to "id".
    * @returns The name of the id field in the index
    * @type String
    * @see #setIdFieldname 
    */
   this.getIdFieldname = function() {
      return idFieldname;
   };

   /**
    * Sets the name of the field containing the unique identifier
    * of document objects in the index wrapped by this IndexManager.
    * @see #getIdFieldname 
    */
   this.setIdFieldname = function(name) {
      idFieldname = name;
      return;
   };

   /**
    * Returns true if the underlying index is currently optimized.
    * @returns True in case the index is optimized, false otherwise.
    * @type Boolean
    */
   this.hasOptimizingJob = function() {
      for (var i=0; i<queue.size(); i++) {
         if (queue.get(i).type == jala.IndexManager.Job.OPTIMIZE) {
            return true;
         }
      }
      return false;
   };

   /**
    * Returns true if the underlying index is currently rebuilding.
    * @returns True in case the index is rebuilding, false otherwise.
    * @type Boolean
    */
   this.isRebuilding = function() {
      return status == jala.IndexManager.REBUILDING;
   };

   /**
    * Starts the IndexManager worker thread that processes the job queue
    */
   this.start = function() {
      if (!this.isRunning()) {
         interrupted = false;
         thread = app.invokeAsync(this, function() {
            while (interrupted === false) {
               if (this.getStatus() != jala.IndexManager.REBUILDING && !queue.isEmpty()) {
                  var job = queue.remove(0);
                  if (this.processJob(job) === false) {
                     // processing job failed, check if we should re-add
                     if (job.errors < jala.IndexManager.MAXTRIES) {
                        // increment error counter and put back into queue
                        job.errors += 1;
                        queue.add(job);
                     } else {
                        this.log("error", "error during queue flush: tried " +
                                 jala.IndexManager.MAXTRIES + " times to handle " +
                                 job.type + " job " + ", giving up.");
                     }
                  }
                  this.log("debug", "remaining jobs " + queue.size());
                  // put an optimizing job into the queue if there are no other
                  // jobs left to process and the last job was not an optimizing job
                  if (job.type != jala.IndexManager.Job.OPTIMIZE && queue.isEmpty()) {
                     this.optimize();
                  }
               } else {
                  // wait for 100ms before checking again
                  java.lang.Thread.sleep(100);
               }
            }
            return;
         }, [], -1);
         this.log("started successfully");
      } else {
         this.log("already running");
      }
      return;
   };
   
   /**
    * Stops this IndexManager instance
    */
   this.stop = function() {
      interrupted = true;
      thread = null;
      this.log("stopped");
      return;
   };

   /**
    * Returns true if this IndexManager instance is running
    * @returns True if this IndexManager instance is running, false otherwise.
    * @type Boolean
    */
   this.isRunning = function() {
      if (thread != null) {
         return thread.running;
      }
      return false;
   };

   /**
    * Read only reference containing the running status of this IndexManager
    * @type Boolean
    */
   this.running; // for api documentation only, is overwritten by getter below
   this.__defineGetter__("running", function() {
       return this.isRunning()
   });

   /**
    * Read only reference containing the number of pending jobs
    * @type Boolean
    */
   this.pending; // for api documentation only, is overwritten by getter below
   this.__defineGetter__("pending", function() {
       return queue.size()
   });

   /**
    * Main constructor body. Initializes the underlying index.
    */
   var search = new helma.Search();
   var analyzer = helma.Search.getAnalyzer(lang);
   var fsDir = search.getDirectory(new helma.File(dir, name));
   index = search.createIndex(fsDir, analyzer);
   this.log("created/mounted " + index);

   return this;
};

/**
 * Constant defining the maximum number of tries to add/remove
 * an object to/from the underlying index.
 * @type Number
 * @final
 */
jala.IndexManager.MAXTRIES = 10;

/**
 * Constant defining normal mode of this index manager.
 * @type Number
 * @final
 */
jala.IndexManager.NORMAL = 1;

/**
 * Constant defining rebuilding mode of this index manager.
 * @type Number
 * @final
 */
jala.IndexManager.REBUILDING = 2;

/**
 * Returns the milliseconds elapsed between the current timestamp
 * and the one passed as argument.
 * @returns The elapsed time in millis.
 * @type Number
 * @private
 */
jala.IndexManager.getRuntime = function(millis) {
   return java.lang.System.currentTimeMillis() - millis;
};

/** @ignore */
jala.IndexManager.prototype.toString = function() {
   return "[" + this.constructor.name + " '" + this.getName() + "' (" +
          this.pending + " objects queued)]";
};

/**
 * Helper function that prefixes every log message with
 * the name of the IndexManager.
 * @param {String} level An optional logging level. Accepted values
 * @param {String} msg The log message
 * are "debug", "info", "warn" and "error".
 */
jala.IndexManager.prototype.log = function(/* msg, level */) {
   var level = "info", message;
   if (arguments.length == 2) {
      level = arguments[0];
      message = arguments[1];
   } else {
      message = arguments[0];
   }
   app.logger[level]("[" + this.constructor.name + " '" +
                     this.getName() + "'] " + message);
   return;
};

/**
 * Static helper method that returns the value of the "id"
 * field of a document object.
 * @param {helma.Search.Document} doc The document whose id
 * should be returned.
 * @private
 */
jala.IndexManager.prototype.getDocumentId = function(doc) {
   try {
      return doc.getField(this.getIdFieldname()).value;
   } catch (e) {
      // ignore
   }
   return null;
};

/**
 * Queues the document object passed as argument for addition to the underlying
 * index. This includes that all existing documents with the same identifier will
 * be removed before the object passed as argument is added.
 * @param {helma.Search.Document} doc The document object that should be
 * added to the underlying index.
 * @returns True if the job was added successfully to the internal queue,
 * false otherwise.
 * @type Boolean
 * @see helma.Search.Document
 */
jala.IndexManager.prototype.add = function(doc) {
   var id;
   if (!doc) {
      this.log("error", "missing document object to add");
      return false;
   } else if ((id = this.getDocumentId(doc)) == null) {
      this.log("error", "document doesn't contain an Id field '" +
               this.getIdFieldname() + "'");
      return false;
   }
   // the job's callback function which actually adds the document to the index
   var callback = function() {
      var start = java.lang.System.currentTimeMillis();
      this.getIndex().updateDocument(doc, this.getIdFieldname());
      this.log("debug", "added document with Id " + id +
               " to index in " + jala.IndexManager.getRuntime(start) + " ms");
      return;
   }
   var job = new jala.IndexManager.Job(jala.IndexManager.Job.ADD, callback);
   this.getQueue().add(job);
   this.log("debug", "queued adding document " + id + " to index");
   return true;
};

/**
 * Queues the removal of all index documents whose identifier value ("id" by default)
 * matches the number passed as argument.
 * @param {Number} id The identifier value
 * @returns True if the removal job was added successfully to the queue, false
 * otherwise.
 * @type Boolean
 */
jala.IndexManager.prototype.remove = function(id) {
   if (id === null || isNaN(id)) {
      this.log("error", "missing or invalid document id to remove");
      return false;
   }
   // the job's callback function which actually removes all documents
   // with the given id from the index
   var callback = function() {
      var start = java.lang.System.currentTimeMillis();
      this.getIndex().removeDocument(this.getIdFieldname(), parseInt(id, 10));
      this.log("debug", "removed document with Id " + id +
               " from index in " + jala.IndexManager.getRuntime(start) + " ms");
   };
   var job = new jala.IndexManager.Job(jala.IndexManager.Job.REMOVE, callback);
   this.getQueue().add(job);
   this.log("debug", "queued removal of document with Id " + id);
   return true;
};

/**
 * Queues the optimization of the underlying index.
 * @returns True if the optimizing job was added, false otherwise, which means
 * that there is already an optimizing job waiting in the queue.
 * @type Boolean
 */
jala.IndexManager.prototype.optimize = function() {
   if (this.hasOptimizingJob()) {
      return false;
   }
   var callback = function() {
      var start = java.lang.System.currentTimeMillis();
      this.getIndex().optimize();
      this.log("optimized index in " + jala.IndexManager.getRuntime(start) + " ms");
      return;
   };
   var job = new jala.IndexManager.Job(jala.IndexManager.Job.OPTIMIZE, callback);
   this.getQueue().add(job);
   this.log("debug", "queued index optimization");
   return true;
};

/**
 * Processes a single queued job
 * @param {Object} job
 * @private
 */
jala.IndexManager.prototype.processJob = function(job) {
   this.log("debug", job.type + " job has been in queue for " +
            jala.IndexManager.getRuntime(job.createtime.getTime()) +
            " ms, processing now...");
   try {
      job.callback.call(this);
   } catch (e) {
      this.log("error", "Exception while processing job " + job.type + ": " + e);
      return false;
   }
   return true;
};



/*********************
 *****   J O B   *****
 *********************/


/**
 * Creates a new Job instance.
 * @class Instances of this class represent a single index
 * manipulation job to be processed by the index manager.
 * @param {Number} id The Id of the job
 * @param {Number} type The type of job, which can be either
 * jala.IndexManager.Job.ADD, jala.IndexManager.Job.REMOVE
 * or jala.IndexManager.Job.OPTIMIZE.
 * @param {Object} data The data needed to process the job.
 * @returns A newly created Job instance.
 * @constructor
 * @see jala.IndexManager.Job
 */
jala.IndexManager.Job = function(type, callback) {
   /**
    * The type of the job
    * @type Number
    */
   this.type = type;

   /**
    * The data needed to process this job. For adding jobs this property
    * must contain the {@link helma.Search.Document} instance to add to
    * the index. For removal job this property must contain the unique identifier
    * of the document that should be removed from the index. For optimizing
    * jobs this property is null.
    */
   this.callback = callback;

   /**
    * An internal error counter which is increased whenever processing
    * the job failed.
    * @type Number
    * @see jala.IndexManager.MAXTRIES
    */
   this.errors = 0;
   
   /**
    * The date and time at which this job was created.
    * @type Date
    */
   this.createtime = new Date();

   return this;
};

/** @ignore */
jala.IndexManager.Job.prototype.toString = function() {
   return "[Job (type: " + this.type + ")]";
};

/**
 * Constant defining an add job
 * @type Number
 * @final
 */
jala.IndexManager.Job.ADD = "add";

/**
 * Constant defining a removal job
 * @type Number
 * @final
 */
jala.IndexManager.Job.REMOVE = "remove";

/**
 * Constant defining an optimizing job
 * @type Number
 * @final
 */
jala.IndexManager.Job.OPTIMIZE = "optimize";
