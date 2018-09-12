var express = require('express');
var oracledb = require('oracledb');
var vendorDbConn = require('../handleDb/vendorDbConnect');
var router = express.Router();

module.exports = app => {
    app.use('/', router);
    router.get('/productsdata/:locale/:domain', function (req, res) { fetchProductsData(req, res); });

    function fetchProductsData(request, response) {
        vendorDbConn.executeQuery(request, response, function (request, response, connection) {
            let selectStatement = "select product_id, property, prop_value from icecat_data_sample icd ";
            selectStatement += "where icd.locale = :locale ";
            selectStatement += "and icd.product_id in ( ";
            selectStatement += "select product_id from icecat_products_ui icp where icp.locale = :locale "
            selectStatement += "and icp.domain = :domain and rownum <= 10) ";
            selectStatement += "order by icd.product_id";

            console.log("products data select query: ", selectStatement);
            connection.execute(selectStatement,
                {
                    locale: request.params.locale,
                    domain: request.params.domain
                },
                {
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

                        response.end(JSON.stringify(productsDataToObjectArray(result.rows)));
                    }
                    vendorDbConn.connClose(connection);
                }
            );
        });
    } //fetchProdsDataByDomain

    function productsDataToObjectArray(dbResults) {
        const productsMap = new Map();
        const mainPropNames = ['Title', 'Brand', 'MPN', 'UPC', 'Desc'];
        const imagesPropNames = ['HighPicURL', 'Gallery1', 'Gallery2', 'Gallery3']

        for (let i = 0; i < dbResults.length; i++) {
            const prodId = dbResults[i].PRODUCT_ID;
            const propName = dbResults[i].PROPERTY;
            const propValue = dbResults[i].PROP_VALUE;
            let propObj = { name: propName, value: propValue };
            let propType = undefined;
            // propObj[propName] = propValue;            
            if (mainPropNames.indexOf(propName) > -1) {
                propType = "main";
                // console.log("main prop", propName);
            }
            if (imagesPropNames.indexOf(propName) > -1) {
                propType = "images";
            }
            if (propType === undefined) {
                propType = "other";
            }

            if (!productsMap.has(prodId)) {
                // console.log(`new prod ${prodId} propType ${propType}`);
                let prod = {
                    prodId: prodId,
                    mainProps: [],
                    otherProps: [],
                    images: []
                }

                if (propType === "main") {
                    prod.mainProps.push(propObj);
                }
                if (propType === "other") {
                    prod.otherProps.push(propObj);
                }
                if (propType === "images") {
                    prod.images.push(propObj);
                }
                // console.log(prod);
                productsMap.set(prodId, prod);
            }
            else {
                let existingProd = productsMap.get(prodId);
                // console.log(`existing prod ${existingProd} propType ${propType}`);
                if (propType === "main") {
                    existingProd.mainProps.push(propObj);
                }
                if (propType === "other") {
                    existingProd.otherProps.push(propObj);
                }
                if (propType === "images") {
                    existingProd.images.push(propObj);
                }                
                productsMap.set(prodId, existingProd);
            }
        }
        // console.log(productsMap);
        // const responseArray = [...productsMap];
        let prodsArray = Array.from(productsMap.values());
        return prodsArray;
    }
}