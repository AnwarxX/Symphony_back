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
        getDiscountDailyTotals:`SELECT  max(busDt) as busDt , 
        rvcNum  , sum(ttl) as ttl
        FROM [dbo].[AON_SIMPHONY]
        where   busDt='${date}'
        group by rvcNum
        `,
        getTaxDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , 
        RevCtrID as rvcNum , sum(TAX) as taxCollTtl 
        FROM CHECKS
        where CAST(CheckOpen as DATE)='${date}'
        group by RevCtrID
        `,
        getGuestChecks:`SELECT CheckID as guestCheckId, RevCtrID as rvcNum,CheckOpen as clsdBusDt FROM CHECKS where cast(CheckOpen as Date)='${date}'`,
        getMenuItemDimensions:`SELECT MajGrpObjNum as majGrpNum, ObjectNumber as num FROM MENU_ITEM_MASTER`,
        getServiceChargeDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , RevCtrID as rvcNum , sum(AutoGratuity) as ttl FROM CHECKS where CAST(CheckOpen as DATE)='${date}' group by RevCtrID`,
        GuestChecksLineDetails:`SELECT [guestChecksId] as guestCheckId,[busDt],[miNum],[aggTtl],[tmedNum] FROM [dbo].[AON_SIMPHONY] where busDt='${date}'`,
        getTenderMediaDimensions:`SELECT TENDER_MEDIA.ObjectNumber as num, STRING_TABLE.StringText as name  FROM TENDER_MEDIA,STRING_TABLE where TENDER_MEDIA.NameID=STRING_TABLE.StringNumberID`,
        getTaxDimensions:`SELECT TAX.TaxIndex as num,STRING_TABLE.StringText as name FROM TAX,STRING_TABLE where TAX.NameID=STRING_TABLE.StringNumberID`,
    }
}
capsSched()
async function capsSched() {
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
            schedule.scheduleJob(capsCodes[i].capsSchedule, async function () {
                let tes=capsCodes[i]
                try {
                    for (let j = 0; j < monthDays[tes.capsCode].length; j++) {
                        for (let s = 0; s < Object.keys(queries(monthDays[tes.capsCode][j])).length; s++) {
                            capsTotal(Object.keys(queries(monthDays[tes.capsCode][j]))[s],queries(monthDays[tes.capsCode][j])[Object.keys(queries(monthDays[tes.capsCode][j]))[s]],{
                                user: tes.user,
                                password: tes.password,
                                server: tes.server,
                                database: tes.database,
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
                } catch (error) {
                    console.log(error);
                }
            })
    }
    console.log(monthDays);
}
async function capsSchedPush(capsSchedule,capsScheduleStatue,capsCode,lockRef,token) {
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
                for (let s = 0; s < Object.keys(
                    (monthDays[capsCode][j])).length; i++) {
                    capsTotal(Object.keys(queries(monthDays[capsCode][j]))[s],queries(monthDays[capsCode][j])[Object.keys(queries(monthDays[capsCode][j]))[s]],{
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
    try {
        let capsSqlPool = await mssql.GetCreateIfNotExistPool(capsConfig)
        let capsRequest = new sql.Request(capsSqlPool)
        let x=await capsRequest.query(query);
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let columns = ""
        let data = ""
        let check=""
        if (x.recordset[0]!=undefined) {
            for (let i = 0; i < x.recordset.length; i++) {
                columns = ""
                data = ""
                check=""
                let rows=x.recordset[i]
                for (let j = 0; j < Object.keys(rows).length; j++) {
                    columns += Object.keys(rows)[j] + ','
                    if (typeof(rows[Object.keys(rows)[j]])=='object' && rows[Object.keys(rows)[j]]!= null) {
                        rows[Object.keys(rows)[j]]=rows[Object.keys(rows)[j]].toISOString().split("T")[0]
                    }
                    if(rows[Object.keys(rows)[j]] == null) {
                        check+=Object.keys(rows)[j]+"=0 and "
                        data += "0,"
                    }
                    else if (typeof (rows[Object.keys(rows)[j]]) == "number") {
                        check+=Object.keys(rows)[j]+"="+rows[Object.keys(rows)[j]] +" and "
                        data += rows[Object.keys(rows)[j]] + ","
                    }
                    else{
                        check+=Object.keys(rows)[j]+"="+"'"+rows[Object.keys(rows)[j]].toString().split("'").join("")+"'"+" and "
                        // console.log(rows[Object.keys(rows)[j]],typeof(rows[Object.keys(rows)[j]]));
                        data += "'" + rows[Object.keys(rows)[j]].toString().split("'").join("") + "'" + ","
                    }
                }
                y=await request.query(
                    `IF NOT EXISTS (SELECT * FROM ${capsName}
                    WHERE ${check.slice(0, -4)})
                    BEGIN
                    INSERT INTO ${capsName} (${columns.slice(0, -1)})
                    VALUES (${data.slice(0, -1)})
                    END`)
            }
            }
            else{
                console.log("nothing");
            }
        console.log(capsName,"Done");
    } catch (error) {
        console.log("\x1b[31m",error);
    }
}
module.exports.capsConigration = async (req, res) => {
    let databaseConn=JSON.parse(fs.readFileSync('configuration/capsConfig.txt', 'utf8'))
    console.log(await capsConfig.foo());
    res.json(await capsConfig.foo())
}
module.exports.addCaps = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let runtime;
    let myDate=new Date(req.body.CapsSchedule)
    switch (req.body.CapsScheduleStatue) {
        case "day": {//every hour
            let hour = req.body.CapsSchedule.split(":")[0];
            let min = req.body.CapsSchedule.split(":")[1];
            runtime = `0 ${min} ${hour} * * *`
            console.log(runtime);
            break;
        }
        case "year": {
            runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
            console.log(runtime);
    
            break;
        }
        case "month": {
            runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} * *`;
            console.log(runtime);
    
            break;
        }
        default:
            break;
    }
    console.log(runtime);
    req.body.CapsSchedule=runtime
    let addCaps=await request.query(`
        begin
        DECLARE @Isdublicate BIT
        IF NOT EXISTS (SELECT * FROM capsConfig
        WHERE [user]='${req.body.CapsUser}' and password='${req.body.CapsPassword}' and server='${req.body.Capsserver}' and [database]='${req.body.CapsDatabase}' and locRef='${req.body.CapslocRef}' and capsSchedule='${req.body.CapsSchedule}' and capsScheduleStatus='${req.body.CapsScheduleStatue}')
        BEGIN
        INSERT INTO capsConfig ([user],password,server,[database],locRef,capsSchedule,capsScheduleStatus)
        VALUES ('${req.body.CapsUser}','${req.body.CapsPassword}','${req.body.Capsserver}','${req.body.CapsDatabase}','${req.body.CapslocRef}','${req.body.CapsSchedule}','${req.body.CapsScheduleStatue}')
        END
        else
        begin
        SET @Isdublicate=0 
        SELECT @Isdublicate AS 'Isdublicate'
        end
        end`)
    const interfaceCode = await request.query(  `select max(capsCode) from capsConfig`);
    if(addCaps.recordset==undefined){
        capsSchedPush(req.body.CapsSchedule,req.body.CapsScheduleStatue,interfaceCode.recordset[0][""],req.body.CapslocRef,token)
        console.log(capsScJop);
        res.json('Submitted successfully')
    }
    else
        res.json("Already\texists")
}
module.exports.codes = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const interfaseCode = await request.query(`SELECT capsCode From capsConfig EXCEPT SELECT interfaceCode From sundefinition where definitionType='caps'`);
       res.json({interface:interfaseCode.recordset})
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.getCAPS = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const capsview = await request.query(`SELECT  * From capsConfig`);
        res.json(capsview.recordset)
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.Delete = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            console.log(req.body);
            //query to delete mapping data from Mapping table  in  database 
            const values = await request.query(`delete from capsConfig Where capsCode='${req.body.capsCode}'`);
            console.log(`delete from capsConfig Where capsCode='${req.body.capsCode}'`);
            res.json(req.body)//viewing the data which is array of obecjts which is json 
        } catch (error) {
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }
}
module.exports.update = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            //query to delete mapping data from Mapping table  in  database 
            const values = await request.query(`update  capsConfig set user='${req.body.user}',password='${req.body.password}',server='${req.body.server}',database='${req.body.database}',locRef='${req.body.locRef}',capsSchedule='${req.body.capsSchedule}',capsScheduleStatus='${req.body.capsScheduleStatus}'
            Where capsCode='${req.body.capsCode}'`);
            console.log(`update  capsConfig set user='${req.body.user}',password='${req.body.password}',server='${req.body.server}',database='${req.body.database}',locRef='${req.body.locRef}',capsSchedule='${req.body.capsSchedule}',capsScheduleStatus='${req.body.capsScheduleStatus}'
            Where capsCode='${req.body.capsCode}'`);
            res.json(req.body)//viewing the data which is array of obecjts which is json 
        } catch (error) {
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }
}
// discountDailyTotal('getTaxDailyTotals',queries.getTaxDailyTotals,capsConfig[0])