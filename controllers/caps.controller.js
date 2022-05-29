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
function getDaysArray(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d).toISOString().split("T")[0]);}return a.slice(0, -1);};
function queries(date) {
    return{
        getDiscountDailyTotals:`SELECT  max(busDt) as busDt , 
        rvcNum  , sum(ttl)*-1 as ttl
        FROM [dbo].[AON_SIMPHONY]
        where   busDt='${date}'
        group by rvcNum
        `,
        getTaxDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , 
        RevCtrID as rvcNum ,'1' as taxNum , sum(TAX) as taxCollTtl 
        FROM CHECKS
        where CAST(CheckOpen as DATE)='${date}'
        group by RevCtrID
        `,
    //     select  CheckID as guestCheckId, max(cast(CheckClose as date) ) as busDt , MENUITEMID miNum , sum(AmountAfterDiscount) 'aggTtl',  sum(Gross_B_DSC)  as gross ,  0 as 'guestCheckLineItemId' from Daily_Sales_New
    //     where cast(CheckClose as date) = '${date}' 
    //    group by  CheckID , MENUITEMID
        getGuestChecks:`SELECT CheckID as guestCheckId, RevCtrID as rvcNum,CheckNumber as chkNum,CheckOpen as clsdBusDt FROM CHECKS where cast(CheckOpen as Date)='${date}'`,
        getMenuItemDimensions:`SELECT mm.MajGrpObjNum as majGrpNum, mm.ObjectNumber as num,st.StringText as name FROM MENU_ITEM_MASTER as mm,STRING_TABLE as st where mm.NameID=st.StringNumberID`,
        getServiceChargeDailyTotals:`SELECT CAST(max(CheckOpen)AS DATE) AS busDt , RevCtrID as rvcNum , sum(AutoGratuity) as ttl FROM CHECKS where CAST(CheckOpen as DATE)='${date}' group by RevCtrID`,
        GuestChecksLineDetails:`SELECT [guestChecksId] as guestCheckId,[busDt],[miNum],[aggTtl],[gross],[tmedNum],[guestCheckLineItemId] FROM [dbo].[AON_SIMPHONY] where busDt='${date}'`,
        getTenderMediaDimensions:`SELECT TENDER_MEDIA.ObjectNumber as num, STRING_TABLE.StringText as name , TendMedType as type  FROM TENDER_MEDIA,STRING_TABLE where TENDER_MEDIA.NameID=STRING_TABLE.StringNumberID`,
        getTenderMediaDailyTotals:`select '' as 'locRef' , busDt  ,RevCtrId as rvcNum , TendMedID,ObjectNumber as tmedNum , sum(Total) 'ttl' , 0 as Cnt from (
            select StringTbl.StringText , Tend.TendMedID ,TendMed.ObjectNumber ,sum(Tend.CurrencyAmount) 'Total'  ,  chkDtl.RevCtrId  , 
            
            format(Checks.CheckClose,'yyyy-MM-dd') 'busDt'  from TENDER_MEDIA_DETAIL Tend
            left join CHECK_DETAIL chkDtl on Tend.CheckDetailID = chkDtl.CheckDetailID
            left join TENDER_MEDIA TendMed on Tend.TendMedID = TendMed.TendMedID
            
            left join STRING_TABLE StringTbl on TendMed.NameID = StringTbl.StringNumberID
            left join CHECKS Checks on Checks.CheckID = chkDtl.CheckID
            where Tend.CurrencyAmount is not null
            group by StringTbl.StringText,chkDtl.RevCtrID , Checks.CheckClose,TendMed.ObjectNumber, Tend.TendMedID
            ) as Data 
            where busDt='${date}'
            group by RevCtrID,busDt , TendMedID,ObjectNumber
            order by busDt`,
        getTaxDimensions:`SELECT TAX.TaxIndex as num,STRING_TABLE.StringText as name FROM TAX,STRING_TABLE where TAX.NameID=STRING_TABLE.StringNumberID`,
    }
}
capsSched()
async function capsSched() {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let capsCodes=await request.query("SELECT * From capsConfig")
        capsCodes=capsCodes.recordset
        capsMonthDays={}
        for (let i = 0; i < capsCodes.length; i++) {
        //    console.log("capsCode",capsCodes[i].capsCode);
        //     console.log("api",capsCodes[i].capsScheduleStatue,capsCodes[i].capsSchedule);
            let capsDate=capsCodes[i].capsSchedule.split(" ")
            if(capsCodes[i].capsScheduleStatus=="month"){
                capsMonthDays[capsCodes[i].capsCode]=getDaysArray(
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
                capsMonthDays[capsCodes[i].capsCode]=[dat]
            }
            capsScJop[capsCodes[i].capsCode+'caps']=
                schedule.scheduleJob(capsCodes[i].capsSchedule, async function () {
                    let tes=capsCodes[i]
                    try {
                        for (let j = 0; j < capsMonthDays[tes.capsCode].length; j++) {
                            for (let s = 0; s < Object.keys(queries(capsMonthDays[tes.capsCode][j])).length; s++) {
                                capsTotal(Object.keys(queries(capsMonthDays[tes.capsCode][j]))[s],queries(capsMonthDays[tes.capsCode][j])[Object.keys(queries(capsMonthDays[tes.capsCode][j]))[s]],{
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
    } catch (error) {
       console.log(error.message); 
    }
}
async function capsSchedPush(capsSchedule,capsScheduleStatue,capsCode,lockRef,token) {
    // let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    // let request = new sql.Request(sqlPool)
    // let capsCodes=await request.query("SELECT * From interfaceDefinition")
    // capsCodes=capsCodes.recordset
    // let capsMonthDays=[]
    // for (let i = 0; i < capsCodes.length; i++) {
    //    // console.log(capsCodes[i].capsCode);
    //     // apiSch.recordset[0].capsSchedule='* * * * * *'
    //     console.log("api",capsCodes[i].capsScheduleStatue,capsCodes[i].capsSchedule);
    //     console.log(capsMonthDays);
    capsScJop[capsCode]=
        schedule.scheduleJob(capsSchedule, async function () {
            let capsDate=capsSchedule.split(" ")
            if(capsScheduleStatue=="month"){
                capsMonthDays[capsCode]=getDaysArray(
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
                capsMonthDays[capsCode]=[dat]
            }
            for (let j = 0; j < capsMonthDays[capsCode].length; j++) {
                for (let s = 0; s < Object.keys(
                    (capsMonthDays[capsCode][j])).length; i++) {
                    capsTotal(Object.keys(queries(capsMonthDays[capsCode][j]))[s],queries(capsMonthDays[capsCode][j])[Object.keys(queries(capsMonthDays[capsCode][j]))[s]],{
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
async function capsTotal(capsName,query,capsConfig,capsCode,dat,name,respo) {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        capsConfig["dialectOptions"]= {
            "requestTimeout": 300000
          }
        let capsSqlPool = await mssql.GetCreateIfNotExistPool(capsConfig)
        let capsRequest = new sql.Request(capsSqlPool)
        let x=await capsRequest.query(query);
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
                    else{
                        check+=Object.keys(rows)[j]+"="+"'"+rows[Object.keys(rows)[j]].toString().split("'").join("")+"'"+" and "
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
            console.log(capsName,"Done");
        }
        await request.query(
            `IF NOT EXISTS (SELECT * FROM ImportStatus
            WHERE  ApiName='${capsName}-${name}-caps' and Date='${dat}' and interfaceCode='${capsCode}')
            BEGIN
            INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
            VALUES ('${capsName}-${name}-caps','${dat}','Successful','${capsCode}')
            END
            else
            begin
            UPDATE ImportStatus
            SET Status = 'Successful'
            WHERE ApiName='${capsName}-${name}-caps' and Date='${dat}'
            end`)
        if (respo != undefined) {
            respo.json('submitted successfully')
        }
    } catch (error) {
        console.log(error);
        await request.query(
            `IF NOT EXISTS (SELECT * FROM ImportStatus
            WHERE  ApiName='${capsName}-${name}-caps' and Date='${dat}' and interfaceCode='${capsCode}')
            BEGIN
            INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
            VALUES ('${capsName}-${name}-caps','${dat}','Failed','${capsCode}')
            END`)
        if (respo != undefined) {
            respo.json(error.message)
        }
    }
}
module.exports.stop = async (req, res) => {
    try {
        console.log(req.body.interfaceCode);
        capsScJop[req.body.interfaceCode+'caps'].cancel()
        res.json("Schedule has stopped")
    } catch (error) {
        console.log(error);
        res.json(error.message)
    }
}
module.exports.start = async (req, res) => {
    try {
        console.log(req.body.interfaceCode,"start");

        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let caps=await (await request.query(`SELECT * From capsConfig where capsCode='${req.body.interfaceCode}'`)).recordset[0]
        capsScJop[req.body.interfaceCode+'caps'].reschedule(caps.capsSchedule)
        res.json("Schedule has started")
    }catch (error){
        console.log(error);
        res.json(error.message)
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
    let capsCoing={
        user: req.body.CapsUser,
        password: req.body.CapsPassword,
        server: req.body.Capsserver,
        database: req.body.CapsDatabase,
        "options": {
          "abortTransactionOnError": true,
          "encrypt": false,
          "enableArithAbort": true,
          trustServerCertificate: true
        },
        charset: 'utf8'
      }
    try {
    let capsSqlPool = await mssql.GetCreateIfNotExistPool(capsCoing)
    let capsRequest = new sql.Request(capsSqlPool)
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
        WHERE [name]='${req.body.name}' and [user]='${req.body.CapsUser}' and password='${req.body.CapsPassword}' and server='${req.body.Capsserver}' and [database]='${req.body.CapsDatabase}' and locRef='${req.body.CapslocRef}' and capsSchedule='${req.body.CapsSchedule}' and capsScheduleStatus='${req.body.CapsScheduleStatue}')
        BEGIN
        INSERT INTO capsConfig (name,[user],password,server,[database],locRef,capsSchedule,capsScheduleStatus)
        VALUES ('${req.body.name}','${req.body.CapsUser}','${req.body.CapsPassword}','${req.body.Capsserver}','${req.body.CapsDatabase}','${req.body.CapslocRef}','${req.body.CapsSchedule}','${req.body.CapsScheduleStatue}')
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
    } catch (error) {
        res.json(error.message)
    }
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
            console.log('fdgsfdgwsdfg');
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            let runtime;
            let myDate=new Date(req.body.capsSchedule)
            console.log(req.body);
            switch (req.body.capsScheduleStatus) {
                case "day": {//every hour
                    let hour = req.body.capsSchedule.split(":")[0];
                    let min = req.body.capsSchedule.split(":")[1];
                    runtime = `0 ${min} ${hour} * * *`
                    console.log(runtime,"");
                    break;
                }
                case "year": {
                    runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
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
            req.body.capsSchedule=runtime

            //used to establish connection between database and the middleware
            //query to delete mapping data from Mapping table  in  database 
            const values = await request.query(`update  capsConfig set [user]='${req.body.user}',password='${req.body.password}',server='${req.body.server}',name='${req.body.name}',[database]='${req.body.database}',locRef='${req.body.locRef}',capsSchedule='${req.body.capsSchedule}',capsScheduleStatus='${req.body.capsScheduleStatus}'
            Where capsCode='${req.body.capsCode}'`);
            res.json(req.body)//viewing the data which is array of obecjts which is json 
        } catch (error) {
            console.log(error);
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }
}
module.exports.deleteCapsData =async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            console.log(req.body);
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            // let capsCodes=await request.query(`SELECT * From capsConfig where capsCode=${req.body.interface}`)
            if (req.body.api=='getGuestChecks') {
                
                const dele = await request.query(`delete  from  GuestChecksLineDetails where busDt = '${req.body.date}'`);
                const delec = await request.query(`delete  from  getGuestChecks where clsdBusDt = '${req.body.date}'`);
                console.log(dele,delec);

            }
            else if (req.body.api=='all') {

              
            }
            else{
              
            }
            res.json('done')
        } catch (error) {
            console.log("\x1b[31m",error);
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }

}
module.exports.import = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            console.log(req.body);
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            let capsCodes=await request.query(`SELECT * From capsConfig where capsCode=${req.body.interface}`)
            if (req.body.api=='getGuestChecks') {
                await capsTotal(req.body.api,queries(req.body.date)[req.body.api],{
                    user: capsCodes.recordset[0].user,
                    password: capsCodes.recordset[0].password,
                    server: capsCodes.recordset[0].server,
                    database: capsCodes.recordset[0].database,
                    "options": {
                      "abortTransactionOnError": true,
                      "encrypt": false,
                      "enableArithAbort": true,
                      trustServerCertificate: true
                    },
                    charset: 'utf8'
                  },req.body.interface,req.body.date,capsCodes.recordset[0].name)
                await capsTotal('GuestChecksLineDetails',queries(req.body.date)['GuestChecksLineDetails'],{
                      user: capsCodes.recordset[0].user,
                      password: capsCodes.recordset[0].password,
                      server: capsCodes.recordset[0].server,
                      database: capsCodes.recordset[0].database,
                      "options": {
                        "abortTransactionOnError": true,
                        "encrypt": false,
                        "enableArithAbort": true,
                        trustServerCertificate: true
                      },
                      charset: 'utf8'
                    },req.body.interface,req.body.date,capsCodes.recordset[0].name,res)
            }
            else if (req.body.api=='all') {
                for (let i = 0; i < Object.keys(queries(req.body.date)).length; i++) {
                    if (i==Object.keys(queries(req.body.date)).length-1) {
                        await capsTotal(Object.keys(queries(req.body.date))[i],queries(req.body.date)[Object.keys(queries(req.body.date))[i]],{
                            user: capsCodes.recordset[0].user,
                            password: capsCodes.recordset[0].password,
                            server: capsCodes.recordset[0].server,
                            database: capsCodes.recordset[0].database,
                            "options": {
                              "abortTransactionOnError": true,
                              "encrypt": false,
                              "enableArithAbort": true,
                              trustServerCertificate: true
                            },
                            charset: 'utf8'
                          },req.body.interface,req.body.date,capsCodes.recordset[0].name,res)
                    }
                    await capsTotal(Object.keys(queries(req.body.date))[i],queries(req.body.date)[Object.keys(queries(req.body.date))[i]],{
                        user: capsCodes.recordset[0].user,
                        password: capsCodes.recordset[0].password,
                        server: capsCodes.recordset[0].server,
                        database: capsCodes.recordset[0].database,
                        "options": {
                          "abortTransactionOnError": true,
                          "encrypt": false,
                          "enableArithAbort": true,
                          trustServerCertificate: true
                        },
                        charset: 'utf8'
                      },req.body.interface,req.body.date,capsCodes.recordset[0].name)
                }
            }
            else{
                await capsTotal(req.body.api,queries(req.body.date)[req.body.api],{
                    user: capsCodes.recordset[0].user,
                    password: capsCodes.recordset[0].password,
                    server: capsCodes.recordset[0].server,
                    database: capsCodes.recordset[0].database,
                    "options": {
                      "abortTransactionOnError": true,
                      "encrypt": false,
                      "enableArithAbort": true,
                      trustServerCertificate: true
                    },
                    charset: 'utf8'
                  },req.body.interface,req.body.date,capsCodes.recordset[0].name,res)
            }
        } catch (error) {
            console.log("\x1b[31m",error);
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }
}

module.exports.importInterfaceCaps = async (req, res) => {
    try {
        let x =[]
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const interfaseCodes = await request.query(`SELECT * FROM interfaceConnections`);//retrive all interface code
        for (let i = 0; i < interfaseCodes.recordset.length; i++) {
            console.log(interfaseCodes.recordset[i].interfaceCode);
            if(interfaseCodes.recordset[i].type =="CAPS"){
            if (capsScJop[interfaseCodes.recordset[i].interfaceCode+'caps'].nextInvocation() == null ){

                interfaseCodes.recordset[i]['scheduleStatusCaps']=false
                
            }
            else 
            {
                interfaseCodes.recordset[i]['scheduleStatusCaps']=true
            }
            
        }
      

        
        }
        
        res.json(interfaseCodes.recordset)
        
       
    } catch (error){
        console.log(error);
        res.json(error.message)
    }
}