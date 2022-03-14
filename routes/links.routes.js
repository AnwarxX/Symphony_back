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
const sunController=require('../controllers/sun.controller');
const req = require('express/lib/request');
appRoutes.post("/import", apiController.import)
appRoutes.get("/loc",async(req,res)=>{
  //the data from the API
  const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getMenuItemPrices', {
    headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json',
        'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwOWZmZGY4Yy1kMmEyLTQ1NDMtODgzNS1kMDhlZDI1MWE5NzciLCJhdWQiOiJWbEZETGpNMU16UXlOalJoTFRWbU9EQXRORGs1WXkwNE1qRTBMVEV6T0RReFpUYzNPVEl4Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDc5NDM4ODMsImlhdCI6MTY0NjczNDI4MywidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Brtctm7UDkDjly_la_czB7dfePwsxYJk76ErUj0fLNYfbDAj4XTC8tUq7hDS_FifaB16qg3LG8vbfZtHR2-WS9DbBz5ZZ9jb_Y-91_u-L84WUJQG0nS2CJd8SSiFedbeUNz2Yzi7nr9KQDddnUXJ0cMs1RpA9uhZ0rj5ecuUqvm-r0D-1FCtfa6KdKQB9IIMBy9WzoH4I4EHVcMXKRgtqrrWwYdpQVUtHS7w2984PmbfksM6dl0Y_NPRuHWyBJxE0L3zj-Q2y0eBT6XKNQ1XakdSdI2-_l-4ni2O0NRRvsSSJ_kgS2NX0cOLy8ez7Hl02aNuh-uOYXugZb9x_xg5Dq0Kd33HPZgTKN_ruusbm40f3qhz6emSy5AcO7GD_FmqQjWYLdYNHuKrro-znh8oFFU5l2VrfCk4QYBjb049bJVeD4EJCXuG-4d0-ADIRs_zAgSnMottvovKPyzVqn5pHGQuamcdkDCdPY2x_o2ZTfaacJ2lZlxdpZdbP2jNzPrb'
    }
});
console.log(resp);
res.json(resp.data)
})
appRoutes.post("/importSun", sunController.importSun)
appRoutes.get("/codes", apiController.codes)
appRoutes.get('/interfaceCode', apiController.interfaceCode);
appRoutes.get("/", apiController.test)
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
appRoutes.post('/reviewInterface', apiController.reviewInterface);

module.exports = appRoutes;