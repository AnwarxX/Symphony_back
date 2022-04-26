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
let queries={
    getDiscountDailyTotals:`SELECT CAST(max(CHECK_DETAIL.DetailPostingTime)AS DATE) as DetailPostingTime , 
    CHECK_DETAIL.RevCtrID AS RevCtrID , sum(DISCOUNT_ALLOC_DETAIL.Amount) as Amount
    FROM DISCOUNT_ALLOC_DETAIL , CHECK_DETAIL 
    WHERE DISCOUNT_ALLOC_DETAIL.CheckDetailID=CHECK_DETAIL.CheckDetailID
    and CAST(DetailPostingTime as DATE)='2022-04-20'
    group by RevCtrID`,
    getTaxDailyTotals:`SELECT CAST(max(CheckClose)AS DATE) AS CheckClose , 
        RevCtrID , sum(TAX) as TotalTax 
    FROM CHECKS
    where CAST(CheckClose as DATE)='2022-04-19'
    group by RevCtrID
    `,
    getGuestChecks:`SELECT CheckID, RevCtrID FROM CHECKS`,
    getMenuItemDimensions:`SELECT MajGrpObjNum, ObjectNumber FROM MENU_ITEM_MASTER`,
    getServiceChargeDailyTotals:``,
    GuestChecksLineDetails:`SELECT Total, DetailPostingTime,ObjectNumber,CheckID FROM CHECK_DETAIL`,
    getTenderMediaDimensions:`SELECT TendMedID, TendMedType,NameID  FROM TENDER_MEDIA`,
    getTaxDimensions:`SELECT TaxID, TaxIndex,TaxType  FROM TAX`,
}
async function discountDailyTotal(capsName,dat,query) {
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
discountDailyTotal('getTaxDailyTotals','2022-04-18',`
SELECT CAST(max(CheckClose)AS DATE) AS busDt , 
      RevCtrID as rvcNum , sum(TAX) as taxCollTtl 
FROM CHECKS
where CAST(CheckClose as DATE)='2022-04-15'
group by RevCtrID`)