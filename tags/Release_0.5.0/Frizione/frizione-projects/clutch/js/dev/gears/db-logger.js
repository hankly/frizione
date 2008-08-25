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

/*jslint evil: false */
/*global clutch, google */

if (!this.clutch) {
    clutch = {};
}
if (!this.clutch.db) {
    clutch.db = {};
}

/**
 * Database logger. Useful for debugging (especially in WorkerPools).
 *
 * @param {String} name the name of the application database.
 * @return {clutch.db.log} the database logging object.
 */
clutch.db.logger = function (name) {

    var columns = [ 'id', 'name', 'value' ];
    var db = clutch.createGearsDatabase();
    db.open(name);
    db.execute('CREATE TABLE IF NOT EXISTS clutch_logger' +
               ' ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT(256), value TEXT(4096) )');

    /**
     * @class The database logging object.
     * This object is created by the {@link clutch.db.logger} function.
     *
     * @name clutch.db.log
     */
    return /** @scope clutch.db.log.prototype */ {

        /**
         * Writes a log record.
         *
         * @param {String} name the log record name, something like "error", or "warning".
         * @param {String} value the log record value, usually the log message.
         */
        log: function (name, value) {
            var result = db.execute('INSERT INTO clutch_logger (name, value) VALUES(?, ?)', [ name, value ]);
            result.close();
            return db.rowsAffected;
        },

        /**
         * Gets the log record with the specified identifier.
         *
         * @param {Number} id the record identifier.
         * @return {Object} the record, or <code>null</code> if not found.
         */
        get: function (id) {
            var result = db.execute('SELECT id, name, value FROM clutch_logger WHERE id = ?', [ id ]);
            return clutch.db.fromRow(result, columns);
        },

        /**
         * Gets a list of log records with the specified parameters.
         *
         * @param {Object} params the query parameters.
         * @return {Array} the records, or <code>null</code> if not found.
         */
        list: function (params) {
            var query = clutch.db.optionalQuery(params);
            var result = db.execute('SELECT id, name, value FROM clutch_logger' + query);
            return clutch.db.fromRows(result, columns);
        },

        /**
         * Removes (deletes) the log record with the specified identifier.
         *
         * @param {Number} id the record identifier.
         * @return {Number} the number of rows affected.
         */
        remove: function (id)  {
            var result = db.execute('DELETE FROM clutch_logger WHERE id = ?', [ id ]);
            result.close();
            return db.rowsAffected;
        },

        /**
         * Removes (deletes) all log records.
         *
         * @return {Number} the number of rows affected.
         */
        removeAll: function () {
            var result = db.execute('DELETE FROM clutch_logger WHERE 1');
            result.close();
            return db.rowsAffected;
        }
    };
};