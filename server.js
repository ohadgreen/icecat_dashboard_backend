var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
var router = express.Router();

var app = express();
app.use('/', router);

//JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.API_PORT || 5000;

app.listen(port, function () {
    console.log('Server running on port ' + port);
});

router.get("/test", function (req, res) {
    res.json({ message: "API Server Initialized" });
});

router.get("/version", function (req, res) {
    res.json({ message: "API version 1.0" });
});

router.get('/members', function (req, res) { fetchAllMembers(req, res); });

router.get('/products/:domain', function (req, res) { fetchIcecatProdsSampleByDomain(req, res); });

router.get('/domains/:locale', function (req, res) { fetchDomainsListByLocale(req, res); });

router.get('/productsdata', function (req, res) { fetchProductsData(req, res); });

function fetchProductsData(request, response) {
    handleDatabaseOperation(request, response, function (request, response, connection) {
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
                doRelease(connection);
            }
        );
    });
} //fetchAllMembers

function fetchAllMembers(request, response) {
    handleDatabaseOperation(request, response, function (request, response, connection) {
        var selectStatement = "select id, first_name, last_name, email from members_dev";
        connection.execute(selectStatement, {}, {
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
                doRelease(connection);
            }
        );
    });
} //fetchAllMembers

function fetchDomainsListByLocale(request, response) {
    handleDatabaseOperation(request, response, function (request, response, connection) {
        var locale = request.params.locale;
        var query = "select distinct icp.domain from icecat_products icp ";
        query += ` where  locale = '${locale}'`;
        query += " order by icp.domain";
        console.log("query: ", query);
        connection.execute(query, {}, {
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
                doRelease(connection);
            }
        );
    });
} //fetchIcecatProdsSampleByDomain

function fetchIcecatProdsSampleByDomain(request, response) {
    handleDatabaseOperation(request, response, function (request, response, connection) {
        var domain = request.params.domain;
        var query = "select product_id, property, prop_value from icecat_data icd ";
        query += " where  locale = 'EN'";        
        query += ` and domain = '${domain}'`;
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
                doRelease(connection);
            }
        );
    });
} //fetchIcecatProdsSampleByDomain

function handleDatabaseOperation(request, response, callback) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);

    console.log('Handle request: ' + request.url);
    oracledb.getConnection(
        {
            user: "icecat",
            password: "icecat",
            connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=vendbob.vip.qa.ebay.com)(PORT=1521))(CONNECT_DATA=(SID=VENDBOB)))"
        },
        function (err, connection) {
            if (err) {
                console.log('Error in acquiring connection ...');
                console.log('Error message ' + err.message);

                // Error connecting to DB
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({
                    status: 500,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }
                ));
                return;
            }
            // do with the connection whatever was supposed to be done
            console.log('Connection acquired ; go execute ');
            callback(request, response, connection);
        });
}//handleDatabaseOperation

function doRelease(connection) {
    connection.release(
        function (err) {
            if (err) {
                console.error(err.message);
            }
        });
}

