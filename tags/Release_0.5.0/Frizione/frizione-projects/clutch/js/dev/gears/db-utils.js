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

    /**
     * @namespace Gears database functions.
     */
    clutch.db = {};
}

/**
 * Converts a Gears ResultSet into an object.
 * The Gears ResultSet is expected to contain a single row, or no row at all.
 *
 * @param {ResultSet} result the Gears ResultSet to convert.
 * @param {Array} columns the columns to extract.
 * @return {Object} the converted Gears ResultSet, or <code>null</code> if no data available.
 */
clutch.db.fromRow = function (result, columns) {
    if (!result.isValidRow()) {
        result.close();
        return null;
    }
    var i = 0;
    var length = columns.length;
    var name = null;
    var value = {};
    for (i = 0; i < length; i += 1) {
        name = columns[i];
        value[name] = result.fieldByName(name);
    }
    result.close();
    return value;
};

/**
 * Converts a Gears ResultSet into an object.
 * The Gears ResultSet is expected to contain multiple rows, or no row at all.
 *
 * @param {ResultSet} result the Gears ResultSet to convert.
 * @param {Array} columns the columns to extract.
 * @return {Array} the converted ResultSet, or <code>null</code> if no data available.
 */
clutch.db.fromRows = function (result, columns) {
    if (!result.isValidRow()) {
        result.close();
        return null;
    }
    var values = [];
    var i = 0;
    var length = columns.length;
    var name = null;
    var value = null;
    while (result.isValidRow()) {
        value = {};
        values.push(value);
        for (i = 0; i < length; i += 1) {
            name = columns[i];
            value[name] = result.fieldByName(name);
        }
        result.next();
    }
    result.close();
    return values;
};

/**
 * Prepares the optional parameter syntax for a SELECT query.
 * These include: where (WHERE), groupBy (GROUP BY), having (HAVING), orderBy (ORDER BY), limit (LIMIT) and offset (OFFSET).
 *
 * @param {Object} params the optional query parameters.
 * @return {String} the query string.
 */
clutch.db.optionalQuery = function (params) {
    var query = "";
    if (params) {
        if (params.where) {
            query = ' WHERE ' + params.where;
        }
        if (params.groupBy) {
            query += ' GROUP BY ' + params.groupBy;
        }
        if (params.having) {
            query += ' HAVING ' + params.having;
        }
        if (params.orderBy) {
            query += ' ORDER BY ' + params.orderBy;
        }
        if (params.limit) {
            query += ' LIMIT ' + params.limit;
            if (params.offset) {
                query += ' OFFSET ' + params.offset;
            }
        }
    }
    return query;
};