var express = require('express');
var oracledb = require('oracledb');
var vendorDbConn = require('../handleDb/vendorDbConnect');
var router = express.Router();

module.exports = app => {
    app.use('/', router);
    router.get('/members/all', function (req, res) { fetchAllMembers(req, res); });

    function fetchAllMembers(request, response) {
        handleDatabaseOperation(request, response, function (request, response, connection) {
            var selectStatement = "select id, first_name, last_name, email from members_dev";
            vendorDbConn.executeQuery(selectStatement, {}, {
                outFormat: oracledb.OBJECT // Return the result as Object
            },
                function (err, result) {
                    if (err) {
                        console.log('Error in execution of select statement' + err.message);
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error getting members",
                            detailed_message: err.message
                        })
                        );
                    } else {
                        var numRows = result.rows.length;
                        console.log('found ' + numRows + ' records in database');
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(result.rows));
                    }
                    vendorDbConn.connClose(connection);
                }
            );
        });
    } //fetchAllMembers
}