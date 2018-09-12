var express = require('express');
var oracledb = require('oracledb');
var vendorDbConn = require('../handleDb/vendorDbConnect');
var router = express.Router();

module.exports = app => {
    app.use('/', router);
    router.get('/products/:domain', function (req, res) { fetchIcecatProdsSampleByDomain(req, res); });

    function fetchIcecatProdsSampleByDomain(request, response) {
        vendorDbConn.executeQuery(request, response, function (request, response, connection) {
            var domain = request.params.domain;
            var query = "select product_id, property, prop_value from icecat_data icd ";
            query += " where  locale = 'EN'";
            // query += ` and domain = '${domain}'`;
            query += " and icd.property in ('Title', 'Brand', 'MPN', 'UPC', 'Battery type', 'Alarm clock', 'Volume control', 'HighPicURL')";
            query += " and rownum <= 50";
            connection.execute(query, {}, {
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
    } //fetchIcecatProdsSampleByDomain
}
