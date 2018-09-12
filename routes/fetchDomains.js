var express = require('express');
var oracledb = require('oracledb');
var vendorDbConn = require('../handleDb/vendorDbConnect');
var router = express.Router();

module.exports = app => {
    app.use('/', router);
    router.get('/domains/:locale', function (req, res) { fetchDomainsListByLocale(req, res); });

    function fetchDomainsListByLocale(request, response) {
        vendorDbConn.executeQuery(request, response, function (request, response, connection) {
            var query = "select distinct icp.domain from icecat_products_ui icp ";
            query += " where locale = :locale";
            query += " order by icp.domain";
            console.log("query: ", query);
            connection.execute(query, { locale: request.params.locale }, {
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
    } //fetchIcecatProdsSampleByDomain
}
