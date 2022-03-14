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
const qs = require("qs");
const { json } = require('body-parser');
var status=[];
let scJop=[]

async function guestChecks(dat, limit, start, token, res) {
    let resp;
    console.log('start', start);
    await sql.connect(config)
    try {
        console.log("try");
        //used to establish connection between database and the middleware
        //this loop itrates for more 8 days from the date that was sent in the equest
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": dat }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer '+token
            }
        });
        // here we asign the response data to a variable called oneforall
        let oneForAll = resp.data.guestChecks
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let data = "'" + resp.data.locRef + "',";
            let columns = "locRef,";
            let check=""
            for (let j = 0; j < Object.keys(oneForAll[i]).length - 1; j++) {

                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    check+=Object.keys(oneForAll[i])[j]+"=0 and "
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    check+=Object.keys(oneForAll[i])[j]+"="+oneForAll[i][Object.keys(oneForAll[i])[j]] +" and "
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else{
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                    check+=Object.keys(oneForAll[i])[j]+"="+"'"+oneForAll[i][Object.keys(oneForAll[i])[j]]+"'"+" and "
                }
                columns += Object.keys(oneForAll[i])[j] + ","
            }
            console.log(columns);
            console.log(data);
            const media = await sql.query(
                `IF NOT EXISTS (SELECT * FROM getGuestChecks
                    WHERE ${check.slice(0, -4)})
                    BEGIN
                    INSERT INTO getGuestChecks (${columns.slice(0, -1)})
                    VALUES (${data.slice(0, -1)})
                    END`);
            //this query is used to insert the vales in thier columns
            // const media = await sql.query(`INSERT INTO GuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
        if (res==undefined) {
            let status = await sql.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE ApiName='getGuestChecks' and Date='${dat}' and Status='Successful')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES ('getGuestChecks','${dat}','Successful')
                    END`)
                    status.push({API:"getGuestChecks",date:dat,status:'success'})
        }
        else
            res.json({api:"getGuestChecks",date:dat,stats:"Successfylly"})
    } catch (error) {
        start++;
        console.log(error);
        if (start <= limit)
            setTimeout(function () {
                guestChecks(dat, limit, start, token, res);
            }, 3000);
        else {
            console.log(dat,"field");
            res.json({date:dat,stats:"field"})
            status.push({API:"Guest Checks",date:dat,stats:'field'})
            if (res==undefined){
                let status = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='getGuestChecks' and Date='${dat}' and Status='Failed')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES (getGuestChecks,'${dat}','Failed')
                    END`)
            }
            else
                res.json({api:"getGuestChecks",date:dat,stats:'Field'})
        }
        // }
    }
}
async function guestChecksDetails(dat, limit, start, token, res) {
    console.log("guestChecksDetails");
    await sql.connect(config)
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    try {
        // for (let i = 0; i < 8; i++) {
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": dat }, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            });
            let oneForAll = []
            for (let i = 0; i < resp.data.guestChecks.length; i++) {

                for (let j = 0; j < resp.data.guestChecks[i].detailLines.length; j++) {
                    let one = {}
                    one["guestCheckId"] = resp.data.guestChecks[i].guestCheckId
                    for (let k = 0; k < Object.keys(resp.data.guestChecks[i].detailLines[j]).length; k++) {
                        if (typeof (resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]]) == "object" && resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]] != null) {
                            // console.log(Object.keys(resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]]));
                            for (let f = 0; f < Object.keys(resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]]).length; f++) {
                                one[Object.keys(resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]])[f]] = resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]][Object.keys(resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]])[f]];
                            }
                        }
                        else {
                            let x = resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]]
                            if (typeof (resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]]) == "string")
                                if (resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]].split(":").length == 3) {
                                    x = new Date(x).toISOString().slice(0, -1).replace('T', ' ');
                                }
                            one[Object.keys(resp.data.guestChecks[i].detailLines[j])[k]] = resp.data.guestChecks[i].detailLines[j][Object.keys(resp.data.guestChecks[i].detailLines[j])[k]];
                        }

                    }
                    oneForAll.push(one);

                }
            }
            for (let i = 0; i < oneForAll.length; i++) {
                let columns = ""
                let data = ""
                let check=""
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    columns += Object.keys(oneForAll[i])[j] + ','
                    // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        check+=Object.keys(oneForAll[i])[j]+"=0 and "
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        check+=Object.keys(oneForAll[i])[j]+"="+oneForAll[i][Object.keys(oneForAll[i])[j]] +" and "
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else{
                        check+=Object.keys(oneForAll[i])[j]+"="+"'"+oneForAll[i][Object.keys(oneForAll[i])[j]]+"'"+" and "
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                    }
                }
                console.log(columns);
                console.log(data);
                console.log(check);
                const addCase = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM GuestChecksLineDetails
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await sql.query(`INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1).split(" ").join("")}) VALUES (${data.slice(0, -1)})`);
            }
        // }
        status.push({API:"guestChecksDetails",date:dat,status:'success'})
        if (res==undefined) {
            let status = await sql.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='guestChecksDetails' and Date='${dat}' and Status='Successful')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES ('guestChecksDetails','${dat}','Successful')
                    END`)
        }
        else{
            // res.json({api:"guestChecksDetails",date:dat,stats:"Successfylly"})
        }
    } catch (error) {
        start++;
        console.log(error.message);
        if (start <= limit)
            setTimeout(function () {
                guestChecksDetails(dat, limit, start, token, res);
            }, 3000);
        else {
            status.push({api:'guestChecksDetails',date:dat,stats:'field'})
            if (res==undefined)
                await sql.query(
                    `IF NOT EXISTS (SELECT * FROM guestChecksDetails
                        WHERE  ApiName='guestChecksDetails' and Date='${dat}' and Status='Failed')
                        BEGIN
                        INSERT INTO ImportStatus (ApiName,Date,Status)
                        VALUES ('guestChecksDetails','${dat}','Failed')
                        END`);
                // res.json({api:'guestChecksDetails',date:dat,stats:'Faild'})
        }
    }
}
function getDaysArray(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};
async function allForOne(dat, limit, start, apiName, body, token, res) {
    await sql.connect(config)
    // console.log(body);
    try {
            //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive
            //the data from the API
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/'+apiName, body, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            });
            let oneForAll = []
            for (let i = 0; i < resp.data.revenueCenters.length; i++) {
                for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                    for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                        let obj = {}
                        obj["locRef"] = resp.data.locRef
                        obj["busDt"] = resp.data.busDt
                        obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum
                        for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                            console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                            obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                        }
                        oneForAll.push(obj)
                    }
                }
            }
            for (let i = 0; i < oneForAll.length; i++) {
                let columns = ""
                let data = ""
                let check=""
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    columns += Object.keys(oneForAll[i])[j] + ','
                    // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        check+=Object.keys(oneForAll[i])[j]+"=0 and "
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        check+=Object.keys(oneForAll[i])[j]+"="+oneForAll[i][Object.keys(oneForAll[i])[j]] +" and "
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else{
                        check+=Object.keys(oneForAll[i])[j]+"="+"'"+oneForAll[i][Object.keys(oneForAll[i])[j]]+"'"+" and "
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                    }
                }
                // console.log(columns);
                // console.log(data);
                // console.log(check);
                const addCase = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO ${apiName} (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await sql.query(`INSERT INTO ${apiName} (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
            status.push({api:apiName,date:dat,stats:'success'})
            if (res==undefined) {
                console.log(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Successful')
                        BEGIN
                        INSERT INTO ImportStatus (ApiName,Date,Status)
                        VALUES ('${apiName}','${dat}','Successful')
                        END`);
                let status = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Successful')
                        BEGIN
                        INSERT INTO ImportStatus (ApiName,Date,Status)
                        VALUES ('${apiName}','${dat}','Successful')
                        END`)
            }
            else
                res.json({api:apiName,date:dat,stats:'Successfully'})
    }
    catch (error) {
        start++;
        console.log(error.message);
        if (start <= limit)
            setTimeout(function () {
                allForOne(dat, limit, start, apiName, body, token, res);
            }, 3000);
        else {
            console.log(dat,"field");
            status.push({api:apiName,date:dat,stats:'field'})
            if (res==undefined){
                console.log(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Failed')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES (${apiName},'${dat}','Failed')
                    END`);
                await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Failed')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES (${apiName},'${dat}','Failed')
                    END`);
            }
            else
                res.json({api:apiName,date:dat,stats:'Failed'})
        }
    }
}
async function allForTwo(dat, limit, start, apiName, body, token, res) {
    await sql.connect(config)
    console.log(body);
    try {
            //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive
            //the data from the API
            if (apiName=="getLocationDimensions") {
                body={}
            }
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/'+apiName, body, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            });
                // here we asign the response data to a variable called oneforall
            // console.log(Object.keys(resp));
            let oneForAll = resp.data[Object.keys(resp.data)[[Object.keys(resp.data).length-1]]]
            for (let i = 0; i < oneForAll.length; i++) {
                let columns = ""
                let data = ""
                let check=""
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    delete oneForAll[i]["workstations"]
                    columns += Object.keys(oneForAll[i])[j] + ','
                    // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        check+=Object.keys(oneForAll[i])[j]+"=0 and "
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        check+=Object.keys(oneForAll[i])[j]+"="+oneForAll[i][Object.keys(oneForAll[i])[j]] +" and "
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else{
                        check+=Object.keys(oneForAll[i])[j]+"="+"'"+oneForAll[i][Object.keys(oneForAll[i])[j]].toString().split("'").join("")+"'"+" and "
                        console.log(oneForAll[i][Object.keys(oneForAll[i])[j]],typeof(oneForAll[i][Object.keys(oneForAll[i])[j]]));
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]].toString().split("'").join("") + "'" + ","
                    }
                }
                // console.log(columns);
                // console.log(data);
                // console.log(check);
                const addCase = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO ${apiName} (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await sql.query(`INSERT INTO ${apiName} (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
            status.push({api:apiName,date:dat,stats:'success'})
            if (res==undefined) {
                let status = await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Successful')
                        BEGIN
                        INSERT INTO ImportStatus (ApiName,Date,Status)
                        VALUES ('${apiName}','${dat}','Successful')
                        END`)
            }
            else
                res.json({api:apiName,date:dat,stats:'Successfully'})
    }
    catch (error) {
        start++;
        console.log(error.message);
        if (start <= limit)
            setTimeout(function () {
                allForTwo(dat, limit, start, apiName, body, token, res);
            }, 3000);
        else {
            console.log(dat,"field");
            status.push({api:apiName,date:dat,stats:'field'})
            if (res==undefined){
                await sql.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Failed')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES (${apiName},'${dat}','Failed')
                    END`);
            }
            else
                res.json({api:apiName,date:dat,stats:'Failed'})
        }
    }
}
const job = schedule.scheduleJob('0 0 0 * * *', async function () {
    status = [];
    let dt = new Date();
    dt.setHours(dt.getHours() + 2);
    let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    console.log(new Date());
    //await guestChecks(dat, 10, 1);
    //await allForOne(dat, 10, 1, 'getTaxDailyTotals', { "locRef": "CHGOUNA", "busDt": dat })
    //await guestChecksDetails(dat, 10, 1);
    //await TaxDailyTotal(dat, 10, 1)
    //await ServiceChargeDailyTotals(dat, 10, 1)
    //await DiscountDailyTotals(dat, 10, 1)
});
module.exports.import = async (req, res) => {
    console.log(req.body.api);
    // let dates=getDaysArray("2022-02-20","2022-02-23")
    await sql.connect(config)
    token=await sql.query(`select token from interfaceDefinition where interfaceCode =${req.body.interface}`);
    console.log(token.recordset[0].token); 
    // for (let i = 0; i < dates.length; i++) {
        // await guestChecks(req.body.date, 10, 1, token, res);
        if (req.body.api=="getGuestChecks") {
            guestChecksDetails(req.body.date, 10, 1, token.recordset[0].token, res)
            guestChecks(req.body.date, 10, 1, token.recordset[0].token, res)
        } else{
            if( req.body.api=="getTenderMediaDailyTotals" || req.body.api=="getServiceChargeDailyTotals" || req.body.api=="getDiscountDailyTotals" || req.body.api=="getControlDailyTotals" || req.body.api=="getTaxDailyTotals" || req.body.api=="getTaxDailyTotals"){
                allForOne(req.body.date, 10, 1, req.body.api, { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token, res)

            }
            else if(req.body.api=="all"){
                allForOne(req.body.date, 10, 1, "getTenderMediaDailyTotals", { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token)
                allForOne(req.body.date, 10, 1, "getServiceChargeDailyTotals", { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token)
                // allForOne(req.body.date, 10, 1, "getDiscountDailyTotals", { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token)
                // allForOne(req.body.date, 10, 1, "getControlDailyTotals", { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token)
                // allForOne(req.body.date, 10, 1, "getTaxDailyTotals", { "locRef": "CHGOUNA", "busDt": req.body.date }, token.recordset[0].token)
                // guestChecksDetails(req.body.date, 10, 1, token.recordset[0].token)
                // guestChecks(req.body.date, 10, 1, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getTenderMediaDimensions", { "locRef": "CHGOUNA"}, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getRevenueCenterDimensions", { "locRef": "CHGOUNA"}, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getMenuItemDimensions", { "locRef": "CHGOUNA"}, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getTaxDimensions", { "locRef": "CHGOUNA"}, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getMenuItemPrices", { "locRef": "CHGOUNA"}, token.recordset[0].token)
                // allForTwo(req.body.date, 10, 1, "getLocationDimensions", token.recordset[0].token)
            } 
            else{
                allForTwo(req.body.date, 10, 1, req.body.api, { "locRef": "CHGOUNA"}, token.recordset[0].token, res)

            }        }
    // }
    // job.reschedule('* * * * * *')
    // getDaysArray("2022-02-20","2022-02-23")
  //  guestChecks("2022-02-23", 10, 1,res)
//   res.json("done")
}
module.exports.codes = async (req, res) => {
    await sql.connect(config)
    const interfaseCode = await sql.query(`SELECT interfaceCode From  interfaceDefinition `);//retrive all interface code
    const mappingCode = await sql.query(`SELECT MappingCode FROM MappingDefinition `);//retrive all mapping code
   res.json({mapping:mappingCode.recordset ,intreface:interfaseCode.recordset})
}
module.exports.interfaceCode = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    const interfacedata = await sql.query(`SELECT interfaceCode From  interfaceDefinition `)
      //used to establish connection between database and the middleware
      const apidata = await sql.query(`SELECT name FROM sys.Tables where name != 'interfaceDefinition' and name != 'MappingDefinition' and name != 'ImportStatus' and name != 'Mapping' and name != 'PropertySettings' and name != 'GuestChecksLineDetails'`)
    res.json({apidata:apidata.recordset,interfacedata:interfacedata.recordset})//viewing the data which is array of obecjts which is json  
}
module.exports.status = async (req, res) => {
    res.json(status)
}
module.exports.authorization = async (req, res) => {
    console.log(req.body);
    //job.reschedule(req.body.ApiSchedule);
    let resp;
    let clientId=req.body.clientId
    let username=req.body.username
    let password=req.body.password
    let orgname=req.body.enterpriseShortName
    let SunUser = req.body.SunUser
    let SunPassword = req.body.SunPassword
    let Sunserver = req.body.Sunserver
    let SunDatabase = req.body.SunDatabase
    try {
        resp = await axios.post('https://mte4-ohra-idm.oracleindustry.com/oidc-provider/v1/oauth2/signin',qs.stringify({
            username, //gave the values directly for testing
            password,
            orgname
        }), {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': `client_id=${clientId};code_challenge=FlyjQEyPz6tRl-UKGjXCiumY4O6_bqHPkTGAtgTSOOg;code_challenge_method=S256;redirect_uri=apiaccount://callback;response_type=code;state=;`
            }
        , withCredentials: true });
        let redirectUrlCode=resp.data.redirectUrl.split('code')[1].substring(1)
        let resp2 = await axios.post('https://mte4-ohra-idm.oracleindustry.com/oidc-provider/v1/oauth2/token',qs.stringify({
            scope: "openid", //gave the values directly for testing
            grant_type: "authorization_code",
            client_id: clientId,
            code_verifier: "UnIKXBl2u6Mj6B5Un45j07diPyIaBHjcWXt4DUfXc6U",
            code: redirectUrlCode,
            redirect_url: "apiaccount://callback"
        }), {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/x-www-form-urlencoded'
            }
        , withCredentials: true });
        const dbConfig = {
            user: SunUser,
            password: SunPassword,
            server: Sunserver,
            database: SunDatabase,
            "options": {
              "abortTransactionOnError": true,
              "encrypt": false,
              "enableArithAbort": true,
              trustServerCertificate: true
            },
            charset: 'utf8'
          };
        await sql.connect(dbConfig)
        
        console.log(sql.connect(dbConfig),"kkk");
        await  sql.close() 

        token=resp2.data.id_token
        let runtime;
        console.log(token);
        let myDate=new Date(req.body.SunSchedule)
        switch (req.body.SunScheduleStatue) {
            case "day": {//every hour
       
              let hour = req.body.SunSchedule.split(":")[0];
              let min = req.body.SunSchedule.split(":")[1];
              runtime = `0 ${min} ${hour} * * *`
              console.log(runtime);
              break;
            }
            case "year": {
              runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getDay() - 1} ${myDate.getMonth() + 1} *`;
              console.log(runtime);
       
              break;
            }
            case "month": {
              runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getDay() - 1} * *`;
              console.log(runtime);
       
              break;
            }
            default:
              break;
          }
          req.body.SunSchedule=runtime
          myDate=new Date(req.body.ApiSchedule)
          switch (req.body.ApiScheduleStatue) {
              case "apiday": {//every hour
                let hour = req.body.ApiSchedule.split(":")[0];
                let min = req.body.ApiSchedule.split(":")[1];
                runtime = `0 ${min} ${hour} * * *`
                console.log(runtime);
                break;
              }
              case "apiyear": {
                runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getDay() - 1} ${myDate.getMonth() + 1} *`;
                console.log(runtime);
         
                break;
              }
              case "apimonth": {
                runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getDay() - 1} * *`;
                console.log(runtime);
         
                break;
              }
              default:
                break;
            }
        req.body.ApiSchedule=runtime
        let  refresh_token =resp2.data.refresh_token
        let columns = ""
        let data = ""
        let check=""
        for (let j = 0; j < Object.keys(req.body).length; j++) {
            columns += Object.keys(req.body)[j] + ','
            // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
            if ((req.body[Object.keys(req.body)[j]] == null)) {
                check+=Object.keys(req.body)[j]+"=0 and "
                data += "0,"
            }
            else if (typeof (req.body[Object.keys(req.body)[j]]) == "number") {
                check+=Object.keys(req.body)[j]+"="+req.body[Object.keys(req.body)[j]] +" and "
                data += req.body[Object.keys(req.body)[j]] + ","
            }
            else{
                check+=Object.keys(req.body)[j]+"="+"'"+req.body[Object.keys(req.body)[j]]+"'"+" and "
                data += "'" + req.body[Object.keys(req.body)[j]] + "'" + ","
            }
        }
        
        console.log(columns);
        console.log(data);
        console.log(check);
        console.log(
            `IF NOT EXISTS (SELECT * FROM interfaceDefinition
                WHERE ${check.slice(0, -4)})
                BEGIN
                INSERT INTO interfaceDefinition (${columns}token,refreshToken)
                VALUES (${data}'${token}','${refresh_token}')
                END`);
     await sql.connect(config)

        const addCase = await sql.query(
            `IF NOT EXISTS (SELECT * FROM interfaceDefinition
                WHERE ${check.slice(0, -4)})
                BEGIN
                INSERT INTO interfaceDefinition (${columns}token,refreshToken)
                VALUES (${data}'${token}','${refresh_token}')
                END`);

         job.reschedule(req.body.ApiSchedule)     
        //await sql.query(`insert into interfaceDefinition (apiUserName,apiPassword,email,enterpriseShortName,clientId,lockRef,apiSchedule,sunUser,sunPassword,server,sunDatabase,sunSchedule,token,refreshToken,ApiScheduleStatue,SunScheduleStatue) VALUES ('${req.body.userName}','${req.body.password}','${req.body. email}','${req.body.enterpriseShortName}','${req.body.clientId}','${req.body.lockRef}','${req.body.ApiSchedule}','${req.body.SunUser}','${req.body.SunPassword}','${req.body.Sunserver}','${req.body.SunDatabase}','${req.body.SunSchedule}','${req.body.token}','${req.body.refresh_token}','${req.body.ApiScheduleStatue}','${req.body.SunScheduleStatue}')`);
        res.json("Submitted successfully");
    } catch (error) {
        let x=[]
        if(error.message.includes(400))
            x.push("Invalid Client ID")
        if(error.message.includes(401)){
            x.push("Invalid username ,password or enterprise name")
        }
        if(error.message.includes('connect'))
            x.push(error.message)
        res.json(x)
    }
}
module.exports.delete = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    console.log(req.body);
    //query to delete mapping data from Mapping table  in  database 
    const values = await sql.query(`delete from Mapping where MappingType='${req.body.MappingType}' and Source='${req.body.Source}' and Target='${req.body.Target}'`);
    res.json(req.body)//viewing the data which is array of obecjts which is json 
}
module.exports.deleteInterface = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //query to delete PropertySettings data from Mapping table  in  database 
    const values = await sql.query(`delete from PropertySettings where BU='${req.body.BU}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}'`);
    await sql.query(`delete from interfaceDefinition where interfaceCode='${req.body.interfaceCode}'`);
    res.json("deleted successfully")//viewing the data which is array of obecjts which is json 
}
module.exports.reviewInterface = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //query to review PropertySettings data from Mapping table  in  database 
    const values = await sql.query(`select * from interfaceDefinition where interfaceCode='${req.body.interfaceCode}' `);
    res.json(values.recordset[0]);
}
module.exports.importInterface = async (req, res) => {
    await sql.connect(config)
    const interfaseCode = await sql.query(`SELECT [BU],[interfaceCode] ,[MappingCode] FROM [SimphonyApi].[dbo].[PropertySettings]`);//retrive all interface code
   res.json(interfaseCode.recordset)
}
module.exports.SysData = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    let data = []//an empty array used to push all column names with it's table name
    
    const tables = await sql.query(`SELECT name FROM sys.Tables where name != 'interfaceDefinition' and name != 'MappingDefinition' and name != 'ImportStatus' and name != 'Mapping' and name != 'PropertySettings' and name != 'GuestChecksLineDetails'`);//retrive all tables name
    console.log(tables);
    for (let i = 0; i < tables.recordset.length; i++) {//iterate over all the table names
        let x = {}//object that will hold each table name with it's columns
        //retrive all columns name
        const columns = await sql.query(`SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('${tables.recordset[i].name}')`);
        x["TableName"] = tables.recordset[i].name// add an new element to the object with the table name
        x["ColumnNames"] = columns.recordset// add an new element to the object with an array of all the column name to that table
        data.push(x)//push the object to the array
    }
    //used to close the connection between database and the middleware
    res.json(data)//viewing the data which is array of obecjts which is json
}
module.exports.stop = async (req, res) => {
    job.cancel();
    res.json("stopped")
}
module.exports.start = async (req, res) => {
    job.reschedule('* * * * * *');
    res.json("started") 
}
module.exports.revenue = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive all num value from  RevenuCenter table
    const revenue = await sql.query(`SELECT num FROM RevenuCenter `);
    //used to close the connection between database and the middleware
    res.json(revenue.recordset)//viewing the data which is array of obecjts which is json 
}
module.exports.SysDataHandler = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive a specific column values requested from the front end from a specific table
    const values = await sql.query(`SELECT distinct ${req.body.column} FROM ${req.body.table}`);

    res.json(values.recordset)//viewing the data which is array of obecjts which is json 

    //used to close the connection between database and the middleware
}
module.exports.getMapping = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive all mapping data from Mapping table in database
    const mapp = await sql.query(`SELECT * FROM Mapping`);
    //used to close the connection between database and the middleware
    res.json(mapp.recordsets[0])//viewing the data which is array of obecjts which is json 

}
module.exports.postMapping = async (req, res) => {
    
    //used to establish connection between database and the middleware
    await sql.connect(config)
    console.log(req.body);
    //to change the level and Revenue from empty string to null as it should be int 

    for (let i = 0; i < req.body.length; i++) {
        if (req.body[i].MappingType == 'Account') {
            req.body[i].Level = null
            req.body[i].RevenuCenter = null
        }
          //query to insert mapping data(mapp ,value,Revenue,level,inbut) into Mapping table  in  database 
    //const val = await sql.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body.MappingCode}','${req.body.mapp}','${req.body.value}','${req.body.Revenue}','${req.body.level}','${req.body.input}')`);

    //  const values = await sql.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body[i].MappingCode}','${req.body[i].MappingType}','${req.body[i].Source}','${req.body[i].RevenuCenter}','${req.body[i].Level}','${req.body[i].input}')`);
     const values = await sql.query(
        `IF NOT EXISTS (SELECT * FROM Mapping
            WHERE MappingCode='${req.body[i].MappingCode}' and MappingType='${req.body[i].MappingType}' and Source='${req.body[i].Source}' and RevenuCenter='${req.body[i].RevenuCenter}' and ALevel='${req.body[i].Level}' and Target='${req.body[i].input}')
            BEGIN
            INSERT INTO Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target)
            VALUES ('${req.body[i].MappingCode}','${req.body[i].MappingType}','${req.body[i].Source}','${req.body[i].RevenuCenter}','${req.body[i].Level}','${req.body[i].input}')
            END`)
    }
    const val = await sql.query(
        `IF NOT EXISTS (SELECT * FROM MappingDefinition
            WHERE MappingCode='${req.body[0].MappingCode}' and Description='${req.body[0].Description}')
            BEGIN
            INSERT INTO MappingDefinition (MappingCode,Description)
            VALUES ('${req.body[0].MappingCode}','${req.body[0].Description}')
            END`)
    // const val = await sql.query(`insert into MappingDefinition (MappingCode,Description) VALUES  ('${req.body[0].MappingCode}','${req.body[0].Description}')`);
    
console.log(req.body[0].MappingCode);


    //used to close the connection between database and the middleware
    res.json(req.body)//viewing the data which is array of obecjts which is json 
}
async function test(dat, limit, start, apiName, body, token, res) {
    let z=true; 
    await sql.connect(config)
    console.log(body);
    try {
            //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive
            //the data from the API
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/'+apiName, body, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            });
            let arr=[];
            let obj=[];
            let i=0;
            arr[0]=resp.data;
            let limit=Object.keys(resp.data).length-1;
            let c=0;
            let j=0;
            // while (z==true) {
            //     console.log("--------------------------------------------------------------");
            //     if (Array.isArray(arr[j][Object.keys(arr[j])[i]])==true) {
            //         limit=Object.keys(arr[j][Object.keys(arr[j])[i]][0]).length+1
            //         for (let k = 0; k < arr[j][Object.keys(arr[j])[i]].length; k++) {
            //             let te=arr[j][Object.keys(arr[j])[i]][k]
            //             for (let s = 0; s < Object.keys(arr[j])[i].length; s++) {
            //                 if (s!=i) {
            //                     te[Object.keys(arr[j])[s]]=arr[j][Object.keys(arr[j])[s]];
            //                 }
            //             }
            //             console.log(te);
            //             arr.push(arr[j][Object.keys(arr[j])[i]][k])
            //             if(Object.keys(arr[j][Object.keys(arr[j])[i]][k]).length-1>limit)
            //                 limit=Object.keys(arr[j][Object.keys(arr[j])[i]][k]).length-1
            //         }
            //         delete arr[j][Object.keys(arr[j])[i]]
            //         j++;
            //         i=-1;
            //     }
            //     if (i==limit) {
            //         z=false
            //     }
            //     i++;
            // }
            let max = Object.keys(arr[arr.length-1]).length
            console.log("max",max);
            let arr2=[]
            for (let i = 0; i < arr.length; i++) {
                console.log(Object.keys(arr[i]).length);
                if(Object.keys(arr[i]).length==max)
                    arr2.push(arr[i])
            }
            res.json(arr2)
    }
    catch (error) {
        start++;
        console.log(error);
        if (error.message.includes(400)) {
            delete body[Object.keys(body)[1]]
        }
        if (start <= limit)
            setTimeout(function () {
                test(dat, limit, start, apiName, body, token, res);
            }, 3000);
        else {
            console.log(dat,"field");
            status.push({api:apiName,date:dat,stats:'field'})
            if (res==undefined){
                // await sql.query(
                    // `IF NOT EXISTS (SELECT * FROM ImportStatus
                    // WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Failed')
                    // BEGIN
                    // INSERT INTO ImportStatus (ApiName,Date,Status)
                    // VALUES (${apiName},'${dat}','Failed')
                    // END`);
            }
            else
                res.json({api:apiName,date:dat,stats:'Failed'})
        }
    }
}
module.exports.PropertySettings = async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //query to insert Property data(BU,JournalType,Revenue,level,Currencycode) into PropertySettings table in database 
    // const values = await sql.query(`insert into PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,ConnectionCode) VALUES  ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.ConnectionCode}')`);
    console.log(
        `IF NOT EXISTS (SELECT * FROM PropertySettings
            WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
            BEGIN
            INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
            VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
            END`);
    const values = await sql.query(
        `IF NOT EXISTS (SELECT * FROM PropertySettings
            WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
            BEGIN
            INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
            VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
            END`)

    await sql.connect(config)

  const sunCon = await sql.query(`SELECT SunUser,SunPassword,Sunserver,SunDatabase,SunSchedule From  interfaceDefinition where interfaceCode='${req.body.interfaceCode}' `);
  await  sql.close() 
  console.log(sunCon,sunCon.recordset[0].SunSchedule);
  const dbConfig ={
        user: "sa",
        password: "mynewP@ssw0rdsa",
        server: "192.168.1.120",
        database: "SunSystemsData",
        "options": {
          "abortTransactionOnError": true,
          "encrypt": false,
          "enableArithAbort": true,
          trustServerCertificate: true
        },
        charset: 'utf8'
      };
    await sql.connect(dbConfig)
    jobSun.reschedule(sunCon.recordset[0].SunSchedule)     
    //await sql.query(``)
    await  sql.close() 
    //used to close the connection between database and the middleware
    res.json(req.body)//viewing the data which is array of obecjts which is json
}
module.exports.test = async (req, res) => {
    token="eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwOWZmZGY4Yy1kMmEyLTQ1NDMtODgzNS1kMDhlZDI1MWE5NzciLCJhdWQiOiJWbEZETGpNMU16UXlOalJoTFRWbU9EQXRORGs1WXkwNE1qRTBMVEV6T0RReFpUYzNPVEl4Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDc5NDM4ODAsImlhdCI6MTY0NjczNDI4MCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.CW7qJgwmyzLDWryb_Lv3mgwly1eY3X2fltht3Mry4_L3LWY_40hJBGpOS60_5oPdqMS2D2qiakYGVfBv-M_Ypzg2UbJKJ5BBmeejqPKTLtgNWIJ8YUNXi8Q2sP9p4NMzbuJJc9uKvCdh0ZVBPMXx7drB67wpQyjA5BMTHKYCd1qDxby2rzPRODYM22hV_oPNMkTsXAjo_fD9Kg4yM0mWybu4A8676qMvh4nbrMJCeTy6-eZO2gTEwxkM5HTgZUJvgJKhGMa0tsWOqesDOPrO8Ul0tOcjjvIWaBdMvzVxLkOO1UXilp64fFx0GRvGL5npiI6ZsSrd2BRehPCawf0NiZoe1-UmqghMq7urYFNJ6O218erUSmC8PqiyY_ndd2BmbjVeCooPbCWw_HGmGtJu-t1gOR7vE73qhBW3nY7D_0OJQcMIuGQHZqmp3tz4Cy-aSzJvMh_05P51IkG2tqXAOlO4zRkRvd-_aGRvAMTcp3DS1QXPnbWiXJuLfz-Y8Dmy"
    allForTwo("2022-03-02", 10, 1, "getLocationDimensions", {}, token, res)
}