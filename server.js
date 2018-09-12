var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var app = express();
app.use('/', router);

//JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes/fetchDomains')(app);
require('./routes/fetchMembersTest')(app);
require('./routes/fetchProductsDataByDomain')(app);
require('./routes/fetchProductsSampleData')(app);

var port = process.env.API_PORT || 5000;
app.listen(port, function () {
    console.log('Server running on port ' + port);
});

router.get("/test", function (res) {
    return ({ message: "API Server Initialized" });
});

router.get("/version", function (res) {
    res.json({ message: "API version 1.0" });
});