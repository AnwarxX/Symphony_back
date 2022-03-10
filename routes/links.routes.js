// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
//Axios allows us to make HTTP requests (post & get). 
const axios = require('axios');//call for using xios module
const sql = require('mssql')//call for using sql module
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
//node-schedule allows us to schedule jobs (arbitrary functions) for execution at specific dates/time.
const schedule = require('node-schedule');
const date = require('date-and-time');//call for using date-and-time module 
const { response } = require('express');
const qs = require("qs")
const apiController=require('../controllers/api.controller')
const sunController=require('../controllers/sun.controller')
appRoutes.post("/import", apiController.import)
appRoutes.post("/importSun", sunController.importSun)
appRoutes.get("/codes", apiController.codes)
appRoutes.get('/interfaceCode', apiController.interfaceCode);
appRoutes.get("/", apiController.status)
appRoutes.post("/authorization", apiController.authorization)
appRoutes.get("/sunCon", async (req, res) => {
})
appRoutes.post('/delete', apiController.delete);
appRoutes.post('/deleteInterface', apiController.deleteInterface);
appRoutes.get("/importInterface", apiController.importInterface)
//this endpoint used to retrive all the tables name and their columns
appRoutes.get('/SysData', apiController.SysData);
appRoutes.get("/stop", apiController.stop)
appRoutes.get("/start", apiController.start)
// this endpoint used to retrive all num value from  RevenuCenter table
appRoutes.get('/revenue', apiController.revenue);
//this endpoint used to send data(table name and column name) from frontend to search in database and get all column values 
appRoutes.post('/SysDataHandler', apiController.SysDataHandler);
// this endpoint used to retrive all mapping data from Mapping table in database
appRoutes.get('/mapping', apiController.getMapping);
//this endpoint used to send mapping data(mapp ,value,Revenue,level,inbut) from frontend and insert it in  database 
appRoutes.post('/mapping', apiController.postMapping);
//this endpoint used to send  Property data(BU,JournalType,Revenue,level,Currencycode) from frontend and insert it in  database 
appRoutes.post('/PropertySettings', apiController.PropertySettings);
module.exports = appRoutes;