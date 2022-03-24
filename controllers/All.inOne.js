// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
const e = require('cors');
const sql = require('mssql')//call for using sql module
let mssql = require('../configuration/mssql-pool-management.js')
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
var CryptoJS = require("crypto-js");
var fs = require('fs');
const { log } = require('console');

module.exports.uploadLicense = async (req, res) => {
    try {
        console.log("ss");
        //used to establish connection between database and the middleware
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let license =JSON.parse(req.body.license)
        let token =license.token
        console.log(token);
        var bytes  = CryptoJS.AES.decrypt(token, 'lamiaa');
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log("afasf");
        let exDate =JSON.parse(originalText)[0].EndDate
        console.log(exDate);
        var date1 = new Date();
        var date2 = new Date(exDate);
        if(token == undefined ){
            res.json({massage:"invalid License"})
        }
        else if(date1.getTime() > date2.getTime()){
            res.json({massage:"license has expired"})
         }
         else {

        console.log(exDate,token)
        //best to use .getTime() to compare dates
        if(date1.getTime() < date2.getTime()){
           let t = await request.query(`select * from  license`);
           //console.log(t.recordset.length,"kjkjj");
           if(t.recordset.length == 0){
              await request.query(`insert into  license (token) values('${token}')`);
           }
           else if(t.recordset.length > 0){
            console.log(t.recordset.length,"kjkjj");
               //await sql.query(`delete * from license `);
            await request.query(` UPDATE license set token='${token}' 
            WHERE token =(SELECT token FROM license)`);   
           }
        }
        res.json({massage:"License Submited",token:token})//viewing the data which is array of obecjts which is json 
        }
    } catch (error) {
        let x ;
        if(error.message.includes("Unexpected") ){
            x="invalid License"
        }
        else {
            x =error.message
         }
        res.json({massage:x})
    }
}
module.exports.getLisence = async(req,res)=>{
    try{
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let license = await request.query(`select token from license`); 
    if(license.recordset.length != 0 ){
         console.log(license.recordset[0].token);
        res.json(license.recordset[0].token) 

    }
    }
    catch(error){
       res.json(error.message) 
    }
}