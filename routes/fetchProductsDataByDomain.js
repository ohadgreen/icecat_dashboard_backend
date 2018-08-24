var express = require('express');
var oracledb = require('oracledb');
var vendorDbConn = require('../handleDb/vendorDbConnect');
var router = express.Router();

module.exports = app => {
    app.use('/', router);
    router.get('/productsdata', function (req, res) { fetchProductsData(req, res); });

    function fetchProductsData(request, response) {
        // handleDatabaseOperation(request, response, function (request, response, connection) {
        vendorDbConn.executeQuery(request, response, function (request, response, connection) {
            let selectStatement = "select product_id, property, prop_value from icecat_data icd ";
            selectStatement += "where icd.locale = 'EN'"
            selectStatement += "and icd.product_id in ('5849929', '5850432')";
            selectStatement += "order by icd.product_id";

            console.log("select query: ", selectStatement);
            connection.execute(selectStatement, {}, {
                outFormat: oracledb.OBJECT // Return the result as Object
            },
                function (err, result) {
                    if (err) {
                        console.log('Error in execution of select statement' + err.message);
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error getting products data",
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
    } //fetchProdsDataByDomain
}