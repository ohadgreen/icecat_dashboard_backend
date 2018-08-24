var oracledb = require('oracledb');

function executeQuery(request, response, callback) {
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
}//executeQuery

function connClose(connection) {
    connection.release(
        function (err) {
            if (err) {
                console.error(err.message);
            }
        });
}

module.exports = { 
    executeQuery: executeQuery,
    connClose: connClose,
                };