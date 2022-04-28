// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
//Axios allows us to make HTTP requests (post & get). 
const { check, validationResult } = require('express-validator')
const sql = require('mssql')//call for using sql module
const capsConfig = require('../configuration/capsConfig')//call for using configuration module that we create it to store database conaction
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
let mssql = require('../configuration/mssql-pool-management.js')
const { json } = require('body-parser');
const nodemailer = require("nodemailer");
const {google} = require('googleapis');
const { test } = require('./api.controller');
const fs = require('fs')
let queries={
    getDiscountDailyTotals:`SELECT  max(busDt) , 
    rvcNum AS RevCtrID , sum(ttl) as Amount
  FROM [dbo].[AON_SIMPHONY]
  where   busDt='2022-04-18'
  group by rvcNum
`,
    getTaxDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , 
    RevCtrID as rvcNum , sum(TAX) as taxCollTtl 
    FROM CHECKS
    where CAST(CheckOpen as DATE)='2022-04-19'
    group by RevCtrID
    `,
    getGuestChecks:`SELECT CheckID as guestCheckId, RevCtrID as rvcNum FROM CHECKS`,
    getMenuItemDimensions:`SELECT MajGrpObjNum , ObjectNumber FROM MENU_ITEM_MASTER`,
    getServiceChargeDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , RevCtrID as rvcNum , sum(AutoGratuity) as ttl FROM CHECKS where CAST(CheckOpen as DATE)='2022-04-19' group by RevCtrID`,
    GuestChecksLineDetails:`SELECT [guestChecksId],[busDt],[miNum],[aggTtl],[tmedNum] FROM [dbo].[AON_SIMPHONY] where busDt='2022-04-19'`,
    getTenderMediaDimensions:`SELECT TENDER_MEDIA.ObjectNumber, STRING_TABLE.StringText  FROM TENDER_MEDIA,STRING_TABLE where TENDER_MEDIA.NameID=STRING_TABLE.StringNumberID`,
    getTaxDimensions:`SELECT TAX.TaxIndex,STRING_TABLE.StringText  FROM TAX,STRING_TABLE where TAX.NameID=STRING_TABLE.StringNumberID`,
}
async function discountDailyTotal(capsName,query,capsConfig) {
    console.log(capsConfig);
    let capsSqlPool = await mssql.GetCreateIfNotExistPool(capsConfig)
    let capsRequest = new sql.Request(capsSqlPool)
    x=await capsRequest.query(query);
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let columns = ""
    let data = ""
    let check=""
    z=await (await request.query(`SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('${capsName}')`)).recordset;
    for (let j = 0; j < Object.keys(x.recordset[0]).length; j++) {
        columns += Object.keys(x.recordset[0])[j] + ','
        if (typeof(x.recordset[0][Object.keys(x.recordset[0])[j]])=='object') {
            x.recordset[0][Object.keys(x.recordset[0])[j]]=x.recordset[0][Object.keys(x.recordset[0])[j]].toISOString().split("T")[0]
        }
        if(x.recordset[0][Object.keys(x.recordset[0])[j]] == null) {
            check+=Object.keys(x.recordset[0])[j]+"=0 and "
            data += "0,"
        }
        else if (typeof (x.recordset[0][Object.keys(x.recordset[0])[j]]) == "number") {
            check+=Object.keys(x.recordset[0])[j]+"="+x.recordset[0][Object.keys(x.recordset[0])[j]] +" and "
            data += x.recordset[0][Object.keys(x.recordset[0])[j]] + ","
        }
        else{
            check+=Object.keys(x.recordset[0])[j]+"="+"'"+x.recordset[0][Object.keys(x.recordset[0])[j]].toString().split("'").join("")+"'"+" and "
            // console.log(x.recordset[0][Object.keys(x.recordset[0])[j]],typeof(x.recordset[0][Object.keys(x.recordset[0])[j]]));
            data += "'" + x.recordset[0][Object.keys(x.recordset[0])[j]].toString().split("'").join("") + "'" + ","
        }
    }console.log(columns);
    y=await request.query(
        `IF NOT EXISTS (SELECT * FROM ${capsName}
            WHERE ${check.slice(0, -4)})
            BEGIN
            INSERT INTO ${capsName} (${columns.slice(0, -1)})
            VALUES (${data.slice(0, -1)})
            END`)
}
module.exports.capsConigration = async (req, res) => {
    let databaseConn=JSON.parse(fs.readFileSync('configuration/capsConfig.txt', 'utf8'))
    console.log(await capsConfig.foo());
    res.json(await capsConfig.foo())
}
module.exports.addCaps = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let addCaps=await request.query(`
        begin
        DECLARE @Isdublicate BIT
        IF NOT EXISTS (SELECT * FROM capsConfig
        WHERE [user]='${req.body.user}' and password='${req.body.password}' and server='${req.body.server}' and [database]='${req.body.database}')
        BEGIN
        INSERT INTO capsConfig ([user],password,server,[database])
        VALUES ('${req.body.user}','${req.body.password}','${req.body.server}','${req.body.database}')
        END
        else
        begin
        SET @Isdublicate=0 
        SELECT @Isdublicate AS 'Isdublicate'
        end
        end`)
    if(addCaps.recordset==undefined)
        res.json('Submitted successfully')
    else
        res.json("Already\texists")
}
// discountDailyTotal('getTaxDailyTotals',queries.getTaxDailyTotals,capsConfig[0])