// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
const e = require('cors');
const sql = require('mssql')//call for using sql module
let mssql = require('../configuration/mssql-pool-management.js')
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
var CryptoJS = require("crypto-js");
var fs = require('fs');
module.exports.uploadLicense = async (req, res) => {
    try {
        //used to establish connection between database and the middleware
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let license = JSON.parse(req.body.license)
        let token = license.token
        var bytes = CryptoJS.AES.decrypt(token, 'lamiaa');
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        let exDate = JSON.parse(originalText)[0].EndDate
        //console.log(originalText,"jhj");
        var date1 = new Date();
        var date2 = new Date(exDate);
        if (token == undefined) {
            res.json({ massage: "invalid License" })
        }
        else if (date1.getTime() > date2.getTime()) {
            res.json({ massage: "license has expired" })
        }
        else {
            //console.log(exDate,token)
            let t = await request.query(`select * from  license`);
             console.log(t,t.recordset.length);
            //best to use .getTime() to compare dates
              
                    if (t.recordset.length == 0) {
                        await request.query(`insert into license (token) values('${token}')`);
                    }
                    else if (t.recordset.length > 0) {
                        console.log(t.recordset.length,"kjkjj");
                        //await request.query(`delete * from license `);
                        await request.query(` UPDATE license set token='${token}'
                                  WHERE token =(SELECT token FROM license)`);
                    }
                    res.json({ massage: "License Submited", token: token })//viewing the data which is array of obecjts which is json
            }
         } catch (error) {
                    let x;
                    console.log(error);
                    if (error.message.includes("Unexpected")) {
                        x = "invalid License"
                    }
                    else {
                        x = error.message
                    }
                    res.json({ massage: x })
                }
}
module.exports.getLisence = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let license = await request.query(`select token from license`);
        if (license.recordset.length != 0) {
            //  console.log(license.recordset[0].token);
            res.json(license.recordset[0].token)

        }
        else if (license.recordset.length == 0) {
            res.json("please uplode license")

        }
    }
    catch (error) {
        res.json(error.message)
    }
}
module.exports.getInterfaceDeinition = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let suncodes = await (await request.query(`select SunCode,name from sundefinition`)).recordset
        let bucodes = await (await request.query(`select BU from PropertySettings`)).recordset
        let apicodes = await (await request.query(`select interfaceCode,name from interfaceDefinition where interfaceCode not in (SELECT interfaceCode From interfaceConnections where type ='api')`)).recordset
        let mappcodes = await (await request.query(`select MappingCode from Mapping`)).recordset
        let capscodes = await (await request.query(`select capsCode,name from capsConfig where capsCode not in (SELECT interfaceCode From interfaceConnections where type ='caps')`)).recordset
        res.json({sun:suncodes,api:apicodes,BU:bucodes,mapp:mappcodes,caps:capscodes})
    }
    catch (error) {
        res.json(error.message)
    }
}
module.exports.getInterfaceDeinitionEdit = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let suncodes = await (await request.query(`select SunCode from sundefinition`)).recordset
        let bucodes = await (await request.query(`select BU from PropertySettings`)).recordset
        let apicodes = await (await request.query(`select interfaceCode from interfaceDefinition EXCEPT SELECT interfaceCode From interfaceConnections where type ='api' and interfaceCode != ${req.body.interfaceCode}`)).recordset
        let mappcodes = await (await request.query(`select MappingCode from Mapping`)).recordset
        let capscodes = await (await request.query(`select capsCode from capsConfig`)).recordset
        console.log("safiashjfioasj");
        res.json({sun:suncodes,api:apicodes,BU:bucodes,mapp:mappcodes,caps:capscodes})
    }
    catch (error) {
        console.log(error);
        res.json(error.message)
    }
}
