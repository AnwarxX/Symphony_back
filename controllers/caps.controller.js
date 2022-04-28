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
const schedule = require('node-schedule');
const fs = require('fs')
let capsScJop={}
function queries(date) {
    return{
        getDiscountDailyTotals:`SELECT CAST(max(CHECK_DETAIL.DetailPostingTime)AS DATE) as DetailPostingTime , 
        CHECK_DETAIL.RevCtrID AS RevCtrID , sum(DISCOUNT_ALLOC_DETAIL.Amount) as Amount
        FROM DISCOUNT_ALLOC_DETAIL , CHECK_DETAIL 
        WHERE DISCOUNT_ALLOC_DETAIL.CheckDetailID=CHECK_DETAIL.CheckDetailID
        and CAST(DetailPostingTime as DATE)='${date}'
        group by RevCtrID`,
        getTaxDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , 
        RevCtrID as rvcNum , sum(TAX) as taxCollTtl 
        FROM CHECKS
        where CAST(CheckOpen as DATE)='${date}'
        group by RevCtrID
        `,
        getGuestChecks:`SELECT CheckID as guestCheckId, RevCtrID as rvcNum FROM CHECKS where cast(CheckOpen as Date)='${date}'`,
        getMenuItemDimensions:`SELECT MajGrpObjNum , ObjectNumber FROM MENU_ITEM_MASTER`,
        getServiceChargeDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , RevCtrID as rvcNum , sum(AutoGratuity) as ttl FROM CHECKS where CAST(CheckOpen as DATE)='${date}' group by RevCtrID`,
        GuestChecksLineDetails:`SELECT [guestChecksId],[busDt],[miNum],[aggTtl],[tmedNum] FROM [CheckPostingDB].[dbo].[Symphoni_CheckDetails] where busDt='${date}'`,
        getTenderMediaDimensions:`SELECT TENDER_MEDIA.ObjectNumber, STRING_TABLE.StringText  FROM TENDER_MEDIA,STRING_TABLE where TENDER_MEDIA.NameID=STRING_TABLE.StringNumberID`,
        getTaxDimensions:`SELECT TAX.TaxIndex,STRING_TABLE.StringText  FROM TAX,STRING_TABLE where TAX.NameID=STRING_TABLE.StringNumberID`,
    }
}
sched()
async function sched() {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let capsCodes=await request.query("SELECT * From capsConfig")
    capsCodes=capsCodes.recordset
    monthDays={}
    // console.log("capsCodes",capsCodes);
    for (let i = 0; i < capsCodes.length; i++) {
    //    console.log("capsCode",capsCodes[i].capsCode);
    //     console.log("api",capsCodes[i].capsScheduleStatue,capsCodes[i].capsSchedule);
        let capsDate=capsCodes[i].capsSchedule.split(" ")
        if(capsCodes[i].capsScheduleStatus=="month"){
            monthDays[capsCodes[i].capsCode]=getDaysArray(
                new Date(new Date(new Date().getFullYear() + "-" +  
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                ((capsDate[1] < 10) ? "0" :'')+capsDate[1]).setMonth(new Date(new Date().getFullYear() + "-" +  
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                ((capsDate[1] < 10) ? "0" :'')+capsDate[1]).getMonth()-1)).toISOString(),
                new Date().getFullYear() + "-" +
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                ((capsDate[1] < 10) ? "0" :'')+capsDate[1]
            )
        }
        else{
            let dt = new Date();
            dt.setHours(dt.getHours() + 2);
            let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            monthDays[capsCodes[i].capsCode]=[dat]
        }
//console.log("api",capsCodes[i].lockRef);
        capsScJop[capsCodes[i].capsCode]=
            schedule.scheduleJob('* * * * * *', async function () {
                try {
                    for (let j = 0; j < monthDays[capsCodes[i].capsCode].length; j++) {
                        console.log(capsCodes);
                        for (let s = 0; s < Object.keys(queries(monthDays[capsCodes[i].capsCode][j])).length; i++) {
                            // capsTotal(Object.keys(queries(monthDays[capsCodes[i].capsCode][j]))[s],queries(monthDays[capsCodes[i].capsCode][j])[Object.keys(queries(monthDays[capsCodes[i].capsCode][j]))[s]],{
                            //     user: capsCodes[i].user,
                            //     password: capsCodes[i].password,
                            //     server: capsCodes[i].server,
                            //     database: capsCodes[i].database,
                            //     "options": {
                            //       "abortTransactionOnError": true,
                            //       "encrypt": false,
                            //       "enableArithAbort": true,
                            //       trustServerCertificate: true
                            //     },
                            //     charset: 'utf8'
                            //   })
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            })
    }
    console.log(monthDays);
}
async function schedPush(capsSchedule,capsScheduleStatue,capsCode,lockRef,token) {
    // let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    // let request = new sql.Request(sqlPool)
    // let capsCodes=await request.query("SELECT * From interfaceDefinition")
    // capsCodes=capsCodes.recordset
    // let monthDays=[]
    // for (let i = 0; i < capsCodes.length; i++) {
    //    // console.log(capsCodes[i].capsCode);
    //     // apiSch.recordset[0].capsSchedule='* * * * * *'
    //     console.log("api",capsCodes[i].capsScheduleStatue,capsCodes[i].capsSchedule);
    //     console.log(monthDays);
    capsScJop[capsCode]=
        schedule.scheduleJob(capsSchedule, async function () {
            let capsDate=capsSchedule.split(" ")
            if(capsScheduleStatue=="month"){
                monthDays[capsCode]=getDaysArray(
                    new Date(new Date(new Date().getFullYear() + "-" +  
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                    ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                    ((capsDate[1] < 10) ? "0" :'')+capsDate[1]).setMonth(new Date(new Date().getFullYear() + "-" +  
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                    ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                    ((capsDate[1] < 10) ? "0" :'')+capsDate[1]).getMonth()-1)).toISOString(),
                    new Date().getFullYear() + "-" +
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((capsDate[3] < 10) ? "0" :'')+capsDate[3] + "T" +  
                    ((capsDate[2] < 10) ? "0" :'')+capsDate[2] + ":" + 
                    ((capsDate[1] < 10) ? "0" :'')+capsDate[1]
                )
            }
            else{
                let dt = new Date();
                dt.setHours(dt.getHours() + 2);
                let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                monthDays[capsCode]=[dat]
            }
            for (let j = 0; j < monthDays[capsCode].length; j++) {
                for (let s = 0; s < Object.keys(queries(monthDays[capsCodes[i].capsCode][j])).length; i++) {
                    capsTotal(Object.keys(queries(monthDays[capsCodes[i].capsCode][j]))[s],queries(monthDays[capsCodes[i].capsCode][j])[Object.keys(queries(monthDays[capsCodes[i].capsCode][j]))[s]],{
                        user: capsCodes[i].user,
                        password: capsCodes[i].password,
                        server: capsCodes[i].server,
                        database: capsCodes[i].database,
                        "options": {
                          "abortTransactionOnError": true,
                          "encrypt": false,
                          "enableArithAbort": true,
                          trustServerCertificate: true
                        },
                        charset: 'utf8'
                      })
                    }
            }
        })
    // }
}
async function capsTotal(capsName,query,capsConfig) {
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
    }
    console.log(check.slice(0, -4));
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