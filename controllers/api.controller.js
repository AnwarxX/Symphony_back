// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
//Axios allows us to make HTTP requests (post & get). 
const axios = require('axios');//call for using xios module
const { check, validationResult } = require('express-validator')

const sql = require('mssql')//call for using sql module
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
let mssql = require('../configuration/mssql-pool-management.js')
//node-schedule allows us to schedule jobs (arbitrary functions) for execution at specific dates/time.
const schedule = require('node-schedule');
const date = require('date-and-time');//call for using date-and-time module 
const { response } = require('express');
const qs = require("qs");
const { json } = require('body-parser');
const { res } = require('date-and-time');
const fs = require('fs')
const nodemailer = require("nodemailer");
const {google} = require('googleapis');
var CryptoJS = require("crypto-js");



const clientId = "488693672463-atpslq7416c2e6v6c014ec9l6vgltecl.apps.googleusercontent.com"
const clientSecret = "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"
const redirectURI = "https://developers.google.com/oauthplayground"
const refresh_token = "1//049fY2PJQc5HwCgYIARAAGAQSNwF-L9IrH6RXcaDvcQrACfTOJRGTTUgg_QYGBI9gj_3hKb4oFzDbnfkb6oUcMjCzSYx8OkqBALw"
const oAuth2Client = new google.auth.OAuth2(clientId,clientSecret,redirectURI)
oAuth2Client.setCredentials({refresh_token})

var status=[];
let scJop={}
let monthDays={}
async function sendMail(interfaceCode,apiName,dat) {
    try{
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const email = await request.query(`SELECT email FROM interfaceDefinition WHERE interfaceCode=${interfaceCode}`);

      const accrssToken = await oAuth2Client.getAccessToken()
      const transporter = nodemailer.createTransport({
  
        servise: "gmail",
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          type:"OAuth2",
          user: "Actpackageapp@gmail.com",
          clientId: clientId ,
          clientSecret:clientSecret,
          refreshToken:refresh_token,
          accessToken:accrssToken 
        }

        
      });
      var Email = {
        from: '"ACT All-In-One" <'+transporter.options.auth.user+'> ', // sender address
        to: `"lamiaa.mohamed@act.eg"`,
        cc: email.recordset[0].email,
        subject: "ACT  All-in-One", 
        html: `
          <div>
             <p>Dear ,</p>
             Kindly note that the API name:${apiName}  for the date: ${dat} was Failed So please try to import it manually from our app </p>

            <p>Thanks,</p>
                    `}
        const result =  await transporter.sendMail(Email);

        return result

  
    }
    catch(error){
        return error      
    }
  }
async function guestChecks(dat, limit, start, body, token, interfaceCode, res) {
    let resp;
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        console.log("guestChecks",start);
        //used to establish connection between database and the middleware
        //this loop itrates for more 8 days from the date that was sent in the equest
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', body, {
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
            // console.log(columns);
                // console.log(check);
            const media = await request.query(
                `IF NOT EXISTS (SELECT * FROM getGuestChecks
                    WHERE ${check.slice(0, -4)})
                    BEGIN
                    INSERT INTO getGuestChecks (${columns.slice(0, -1)})
                    VALUES (${data.slice(0, -1)})
                    END`);
            //this query is used to insert the vales in thier columns
            // const media = await request.query(`INSERT INTO GuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
            let status = await request.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE ApiName='getGuestChecks' and Date='${dat}' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('getGuestChecks','${dat}','Successful','${interfaceCode}')
                    END
                    else
                    begin
                    UPDATE ImportStatus
                    SET Status = 'Successful'
                    WHERE ApiName='getGuestChecks' and Date='${dat}' and interfaceCode='${interfaceCode}'
                    end`)
        console.log("guestChecks done");
                    // status.push({API:"getGuestChecks",date:dat,status:'success'})
        if (res!=undefined)
            res.json("Imported successfully")
    } catch (error) {
        start++;
        console.log(error.message);
        if(error.response!=undefined)
            if(error.response.data.detail.includes('expired')){
            token=refreshToken(token);
        }
        if (start <= limit)
            setTimeout(function () {
                guestChecks(dat, limit, start, body, token, interfaceCode, res);
            }, 3000);
        else {
            console.log(dat,"field");
            // status.push({API:"Guest Checks",date:dat,stats:'field'})
            sendMail(interfaceCode,'getGuestChecks',dat)
            .then((result)=> console.log('email sent',result))
            .catch((error)=> console.log(error.message));
            if (res==undefined){
                let status = await request.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='getGuestChecks' and Date='${dat}' and Status='Failed' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('getGuestChecks','${dat}','Failed','${interfaceCode}')
                    END`)
            }
            else{
                res.json("Failed to Import")
            }
        }
        // }
    }
}
async function guestChecksDetails(dat, limit, start, body, token, interfaceCode, res) {
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        console.log("guestChecksDetails",start);
        // for (let i = 0; i < 8; i++) {
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', body, {
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
                // console.log(columns);
                // console.log(data);
                // console.log(check);
                const addCase = await request.query(
                    `IF NOT EXISTS (SELECT * FROM GuestChecksLineDetails
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await request.query(`INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1).split(" ").join("")}) VALUES (${data.slice(0, -1)})`);
            }
        // }
        // status.push({API:"guestChecksDetails",date:dat,status:'success'})
            let status = await request.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='guestChecksDetails' and Date='${dat}' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('guestChecksDetails','${dat}','Successful','${interfaceCode}')
                    END
                    else
                    begin
                    UPDATE ImportStatus
                    SET Status = 'Successful'
                    WHERE ApiName='guestChecksDetails' and Date='${dat}' and interfaceCode='${interfaceCode}'
                    end`)
        console.log("guestChecksDetails done");
        if (res!=undefined){
            res.json("Imported successfully")
        }
    } catch (error) {
        start++;
        console.log(error.message);
        if(error.response!=undefined)
            if(error.response.data.detail.includes('expired')){
                token=refreshToken(token);
            }
        if (start <= limit)
            setTimeout(function () {
                guestChecksDetails(dat, limit, start, body, token, interfaceCode, res);
            }, 3000);
        else {
            // status.push({api:'guestChecksDetails',date:dat,stats:'field'})
            
            if (res==undefined)
            sendMail(interfaceCode,'guestChecksDetails',dat)
            .then((result)=> console.log('email sent',result))
            .catch((error)=> console.log(error.message));
                await request.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                        WHERE  ApiName='guestChecksDetails' and Date='${dat}' and Status='Failed' and interfaceCode='${interfaceCode}')
                        BEGIN
                        INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                        VALUES ('guestChecksDetails','${dat}','Failed','${interfaceCode}')
                        END`);
                // res.json({api:'guestChecksDetails',date:dat,stats:'Faild'})
        }
    }
}
function getDaysArray(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d).toISOString().split("T")[0]);}return a.slice(0, -1);};
async function allForOne(dat, limit, start, apiName, body, token, interfaceCode, res) {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        console.log(apiName,start);
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
                            // console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
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
                const addCase = await request.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO ${apiName} (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await request.query(`INSERT INTO ${apiName} (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
            // status.push({api:apiName,date:dat,stats:'success'})
            let status = await request.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('${apiName}','${dat}','Successful','${interfaceCode}')
                    END
                    else
                    begin
                    UPDATE ImportStatus
                    SET Status = 'Successful'
                    WHERE ApiName='${apiName}' and Date='${dat}'
                    end`)
                    console.log(apiName,"done");
            if (res!=undefined)
                res.json("Imported successfully")
    }
    catch (error) {
        start++;
        console.log("\x1b[31m",error);
        if(error.response!=undefined)
            if(error.response.data.detail.includes('expired')){
                token=refreshToken(token);
               
            }
        if (start <= limit)
            setTimeout(function () {
                allForOne(dat, limit, start, apiName, body, token, interfaceCode, res);
            }, 3000);
        else {
            console.log(dat,"field");
            // status.push({api:apiName,date:dat,stats:'field'})
            sendMail(interfaceCode,apiName,dat)
                .then((result)=> console.log('email sent',result))
                .catch((error)=> console.log(error.message));
            if (res==undefined){
                
                await request.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and Status='Failed' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('${apiName}','${dat}','Failed','${interfaceCode}')
                    END`);
            }
            else
                res.json("Failed to Import")
        }
    }
}
async function allForTwo(dat, limit, start, apiName, body, token, interfaceCode, res) {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        console.log(apiName,start);
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
            console.log(oneForAll.length);
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
                        // console.log(oneForAll[i][Object.keys(oneForAll[i])[j]],typeof(oneForAll[i][Object.keys(oneForAll[i])[j]]));
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]].toString().split("'").join("") + "'" + ","
                    }
                }
                // console.log(columns);
                // console.log(data);
                // console.log(check);
                const addCase = await request.query(
                    `IF NOT EXISTS (SELECT * FROM ${apiName}
                        WHERE ${check.slice(0, -4)})
                        BEGIN
                        INSERT INTO ${apiName} (${columns.slice(0, -1)})
                        VALUES (${data.slice(0, -1)})
                        END`);
                // const addCase = await request.query(`INSERT INTO ${apiName} (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
            // status.push({api:apiName,date:dat,stats:'success'})
            let status = await request.query(
                `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}' and interfaceCode='${interfaceCode}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
                    VALUES ('${apiName}','${dat}','Successful','${interfaceCode}')
                    END
                    else
                    begin
                    UPDATE ImportStatus
                    SET Status = 'Successful'
                    WHERE ApiName='${apiName}' and Date='${dat}' and interfaceCode='${interfaceCode}'
                    end`)
            if (res!=undefined)
                res.json("Imported successfully")
    }
    catch (error) {
        start++;
        console.log(error);
        if(error.response!=undefined)
            if(error.response.data.detail.includes('expired')){
                token=refreshToken(token);
            }
        if (start <= limit)
        setTimeout(function () {
                allForTwo(dat, limit, start, apiName, body, token, interfaceCode, res);
            }, 3000);
        else {
            console.log(dat,"field");
            // status.push({api:apiName,date:dat,stats:'field'})
            sendMail(interfaceCode,apiName,dat)
            .then((result)=> console.log('email sent',result))
            .catch((error)=> console.log(error.message));
            if (res==undefined){
                await request.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES ('${apiName}','${dat}','Failed')
                    END`);
            }
            else
                res.json("Failed to Import")
        }
    }
}
function tree(json,finalJson,key,arrayIndex){
    for (let i = 0; i < Object.keys(json).length; i++) {
        if(Array.isArray(json[Object.keys(json)[i]])&&json[Object.keys(json)[i]]!=null){
            for (let j = 0; j < json[Object.keys(json)[i]].length; j++) {
                if(typeof(json[Object.keys(json)[i]][j])=='object'){
                    if (key==undefined)
                        tree(json[Object.keys(json)[i]][j],finalJson,Object.keys(json)[i]+j)
                    else
                        tree(json[Object.keys(json)[i]][j],finalJson,key+Object.keys(json)[i]+j)
                }
                else{
                    if (key==undefined)
                        finalJson[Object.keys(json)[i]+j]=json[Object.keys(json)[i]][j];
                    else
                        finalJson[key+Object.keys(json)[i]+j]=json[Object.keys(json)[i]][j];
                }
            }
        }
        else if (typeof(json[Object.keys(json)[i]])=='object'&&json[Object.keys(json)[i]]!=null) {
            if (key==undefined) {
                tree(json[Object.keys(json)[i]],finalJson,Object.keys(json)[i])
            }
            else{
                tree(json[Object.keys(json)[i]],finalJson,key+Object.keys(json)[i])
            }
        }
        else
            if(key==undefined){
                finalJson[Object.keys(json)[i]]=json[Object.keys(json)[i]];
            }
            else{
                finalJson[key+Object.keys(json)[i]]=json[Object.keys(json)[i]];
            }
    }
    console.log(finalJson);
}
async function jsonTree(dat, limit, start, apiName, body, token, interfaceCode, res) {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        console.log(apiName,start);
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
            let finalJsonArray=[]
            let finalJson={}
            console.log("Started");
            tree(resp.data,finalJson)
            // status.push({api:apiName,date:dat,stats:'success'})
            // let status = await request.query(
            //     `IF NOT EXISTS (SELECT * FROM ImportStatus
            //         WHERE  ApiName='${apiName}' and Date='${dat}' and interfaceCode='${interfaceCode}')
            //         BEGIN
            //         INSERT INTO ImportStatus (ApiName,Date,Status,interfaceCode)
            //         VALUES ('${apiName}','${dat}','Successful','${interfaceCode}')
            //         END
            //         else
            //         begin
            //         UPDATE ImportStatus
            //         SET Status = 'Successful'
            //         WHERE ApiName='${apiName}' and Date='${dat}' and interfaceCode='${interfaceCode}'
            //         end`)
            if (res!=undefined)
                res.json(finalJson)
    }
    catch (error) {
        start++;
        console.log(error.response.data.detail);
        if(error.response!=undefined)
            if(error.response.data.detail.includes('expired')){
                token=refreshToken(interfaceCode);
            }
        if (start <= limit)
        setTimeout(function () {
            jsonTree(dat, limit, start, apiName, body, token, interfaceCode, res);
            }, 3000);
        else {
            console.log(dat,"field");
            // status.push({api:apiName,date:dat,stats:'field'})
            sendMail(interfaceCode,apiName,dat)
            .then((result)=> console.log('email sent',result))
            .catch((error)=> console.log(error.message));
            if (res==undefined){
                await request.query(
                    `IF NOT EXISTS (SELECT * FROM ImportStatus
                    WHERE  ApiName='${apiName}' and Date='${dat}')
                    BEGIN
                    INSERT INTO ImportStatus (ApiName,Date,Status)
                    VALUES ('${apiName}','${dat}','Failed')
                    END`);
            }
            else
                res.json("Failed to Import")
        }
    }
}
async function refreshToken(interfaceCode) {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    x=await request.query(`select token,refreshToken,clientId from interfaceDefinition where interfaceCode ='${interfaceCode}'`);
    console.log(x);
    try {
        let resp2 = await axios.post('https://mte4-ohra-idm.oracleindustry.com/oidc-provider/v1/oauth2/token',qs.stringify({
            scope: "openid", //gave the values directly for testing
            grant_type: "refresh_token",
            client_id: x.recordset[0].clientId,
            code_verifier: "UnIKXBl2u6Mj6B5Un45j07diPyIaBHjcWXt4DUfXc6U",
            refresh_token: x.recordset[0].refreshToken,
            redirect_url: "apiaccount://callback"
        }), {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/x-www-form-urlencoded'
            }
        , withCredentials: true });
        y=await request.query(`update interfaceDefinition set refreshToken='${resp2.data.refresh_token}',token='${resp2.data.id_token}' where interfaceCode ='${interfaceCode}'`);
        console.log("refreshed");
        console.log(resp2.data);
        return resp2.data.id_token;
    } catch (error) {
        console.log(error);
        return x.recordset[0].token
    }
}
sched()
async function sched() {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let interfaceCodes=await request.query("SELECT * From interfaceDefinition")
    interfaceCodes=interfaceCodes.recordset
    monthDays={}
    // console.log("interfaceCodes",interfaceCodes);
    for (let i = 0; i < interfaceCodes.length; i++) {
    //    console.log("interfaceCode",interfaceCodes[i].interfaceCode);
    //     console.log("api",interfaceCodes[i].ApiScheduleStatue,interfaceCodes[i].ApiSchedule);
        let apiDate=interfaceCodes[i].ApiSchedule.split(" ")
        if(interfaceCodes[i].ApiScheduleStatue=="apimonth"){
            monthDays[interfaceCodes[i].interfaceCode+"api"]=getDaysArray(
                new Date(new Date(new Date().getFullYear() + "-" +  
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                ((apiDate[1] < 10) ? "0" :'')+apiDate[1]).setMonth(new Date(new Date().getFullYear() + "-" +  
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                ((apiDate[1] < 10) ? "0" :'')+apiDate[1]).getMonth()-1)).toISOString(),
                new Date().getFullYear() + "-" +
                (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                ((apiDate[1] < 10) ? "0" :'')+apiDate[1]
            )
        }
        else{
            let dt = new Date();
            dt.setHours(dt.getHours() + 2);
            let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            monthDays[interfaceCodes[i].interfaceCode+"api"]=[dat]
        }
//console.log("api",interfaceCodes[i].lockRef);
        scJop[interfaceCodes[i].interfaceCode+"api"]=
            schedule.scheduleJob(interfaceCodes[i].ApiSchedule, async function () {
                for (let j = 0; j < monthDays[interfaceCodes[i].interfaceCode+"api"].length; j++) {
                    allForOne(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, "getTenderMediaDailyTotals", { "locRef": interfaceCodes[i].lockRef, "busDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] },interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    allForOne(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, "getServiceChargeDailyTotals", { "locRef": interfaceCodes[i].lockRef, "busDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    allForOne(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, "getDiscountDailyTotals", { "locRef": interfaceCodes[i].lockRef, "busDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    allForOne(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, "getControlDailyTotals", { "locRef": interfaceCodes[i].lockRef, "busDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    allForOne(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, "getTaxDailyTotals", { "locRef": interfaceCodes[i].lockRef, "busDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    guestChecksDetails(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, { "locRef": interfaceCodes[i].lockRef, "clsdBusDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                    guestChecks(monthDays[interfaceCodes[i].interfaceCode+"api"][j], 10, 1, { "locRef": interfaceCodes[i].lockRef, "clsdBusDt": monthDays[interfaceCodes[i].interfaceCode+"api"][j] }, interfaceCodes[i].token,interfaceCodes[i].interfaceCode)
                }
            })
    }
}
async function schedPush(ApiSchedule,ApiScheduleStatue,interfaceCode,lockRef,token) {
    // let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    // let request = new sql.Request(sqlPool)
    // let interfaceCodes=await request.query("SELECT * From interfaceDefinition")
    // interfaceCodes=interfaceCodes.recordset
    // let monthDays=[]
    // for (let i = 0; i < interfaceCodes.length; i++) {
    //    // console.log(interfaceCodes[i].interfaceCode);
    //     // apiSch.recordset[0].ApiSchedule='* * * * * *'
    //     console.log("api",interfaceCodes[i].ApiScheduleStatue,interfaceCodes[i].ApiSchedule);
    //     console.log(monthDays);
    scJop[interfaceCode+"api"]=
        schedule.scheduleJob(ApiSchedule, async function () {
            let apiDate=ApiSchedule.split(" ")
            if(ApiScheduleStatue=="apimonth"){
                monthDays[interfaceCode+"api"]=getDaysArray(
                    new Date(new Date(new Date().getFullYear() + "-" +  
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                    ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                    ((apiDate[1] < 10) ? "0" :'')+apiDate[1]).setMonth(new Date(new Date().getFullYear() + "-" +  
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                    ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                    ((apiDate[1] < 10) ? "0" :'')+apiDate[1]).getMonth()-1)).toISOString(),
                    new Date().getFullYear() + "-" +
                    (((new Date().getMonth()+1) < 10) ? "0" :'')  +(new Date().getMonth()+ 1)+ "-" + 
                    ((apiDate[3] < 10) ? "0" :'')+apiDate[3] + "T" +  
                    ((apiDate[2] < 10) ? "0" :'')+apiDate[2] + ":" + 
                    ((apiDate[1] < 10) ? "0" :'')+apiDate[1]
                )
            }
            else{
                let dt = new Date();
                dt.setHours(dt.getHours() + 2);
                let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                monthDays[interfaceCode+"api"]=[dat]
            }
            for (let j = 0; j < monthDays[interfaceCode+"api"].length; j++) {
                allForOne(monthDays[interfaceCode+"api"][j], 10, 1, "getTenderMediaDailyTotals", { "locRef": lockRef, "busDt": monthDays[interfaceCode+"api"][j] },token,interfaceCode)
                allForOne(monthDays[interfaceCode+"api"][j], 10, 1, "getServiceChargeDailyTotals", { "locRef": lockRef, "busDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
                allForOne(monthDays[interfaceCode+"api"][j], 10, 1, "getDiscountDailyTotals", { "locRef": lockRef, "busDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
                allForOne(monthDays[interfaceCode+"api"][j], 10, 1, "getControlDailyTotals", { "locRef": lockRef, "busDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
                allForOne(monthDays[interfaceCode+"api"][j], 10, 1, "getTaxDailyTotals", { "locRef": lockRef, "busDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
                guestChecksDetails(monthDays[interfaceCode+"api"][j], 10, 1,{ "locRef": lockRef, "clsdBusDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
                guestChecks(monthDays[interfaceCode+"api"][j], 10, 1,{ "locRef": lockRef, "clsdBusDt": monthDays[interfaceCode+"api"][j] }, token,interfaceCode)
            }
        })
    // }
}
module.exports.import = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    console.log(req.body);
    // let dates=getDaysArray("2022-02-20","2022-02-23")
    // let interConn=await request.query(`select interfaceCode from interfaceConnections where connectionCode =${req.body.interface}`);
    let token=await request.query(`select token,lockRef from interfaceDefinition where interfaceCode =${req.body.interface}`);
    // console.log(token.recordset[0].token); 
    // for (let i = 0; i < dates.length; i++) {
        // await guestChecks(req.body.date, 10, 1, token, res);
        if (req.body.api=="getGuestChecks") {
            guestChecksDetails(req.body.date, 10, 1,{ "locRef": token.recordset[0].lockRef, "clsdBusDt":req.body.date }, token.recordset[0].token,req.body.interface,res)
            guestChecks(req.body.date, 10, 1,{ "locRef": token.recordset[0].lockRef, "clsdBusDt":req.body.date }, token.recordset[0].token,req.body.interface)
        } else{
            if( req.body.api=="getTenderMediaDailyTotals" || req.body.api=="getServiceChargeDailyTotals" || req.body.api=="getDiscountDailyTotals" || req.body.api=="getControlDailyTotals" || req.body.api=="getTaxDailyTotals" || req.body.api=="getTaxDailyTotals"){
                allForOne(req.body.date, 10, 1, req.body.api, { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface,res)
            }
            else if(req.body.api=="all"){
                allForOne(req.body.date, 10, 1, "getTenderMediaDailyTotals", { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface)
                allForOne(req.body.date, 10, 1, "getServiceChargeDailyTotals", { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface)
                allForOne(req.body.date, 10, 1, "getDiscountDailyTotals", { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface)
                allForOne(req.body.date, 10, 1, "getControlDailyTotals", { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface)
                allForOne(req.body.date, 10, 1, "getTaxDailyTotals", { "locRef": token.recordset[0].lockRef, "busDt": req.body.date }, token.recordset[0].token,req.body.interface)
                guestChecksDetails(req.body.date, 10, 1,{ "locRef": token.recordset[0].lockRef, "clsdBusDt":req.body.date }, token.recordset[0].token,req.body.interface)
                guestChecks(req.body.date, 10, 1,{ "locRef": token.recordset[0].lockRef, "clsdBusDt":req.body.date }, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getTenderMediaDimensions", { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getRevenueCenterDimensions", { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getMenuItemDimensions", { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getTaxDimensions", { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getMenuItemPrices", { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface)
                allForTwo(req.body.date, 10, 1, "getLocationDimensions",{}, token.recordset[0].token,req.body.interface)
                res.json("done")
            }
            else{
                allForTwo(req.body.date, 10, 1, req.body.api, { "locRef": token.recordset[0].lockRef}, token.recordset[0].token,req.body.interface,res)

            }        
        }
    // }
    // job.reschedule('* * * * * *')
    // getDaysArray("2022-02-20","2022-02-23")
  //  guestChecks("2022-02-23", 10, 1,res)
}
module.exports.codes = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const interfaseCode = await request.query(`SELECT interfaceCode From  interfaceDefinition `);//retrive all interface code
        const mappingCode = await request.query(`SELECT MappingCode FROM MappingDefinition `);//retrive all mapping code
       res.json({mapping:mappingCode.recordset ,intreface:interfaseCode.recordset})
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.interfaceCode = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        //used to establish connection between database and the middleware
        const interfacedata = await request.query(`SELECT interfaceCode From  interfaceDefinition `)
          //used to establish connection between database and the middleware
          const apidata = await request.query(`SELECT name FROM sys.Tables where name != 'interfaceDefinition' and name != 'MappingDefinition' and name != 'ImportStatus' and name != 'Mapping' and name != 'PropertySettings' and name != 'GuestChecksLineDetails' and name != 'License' and name != 'sundefinition' and name != 'capsConfig' and name != 'interfaceConnections' and name != 'GuestChecksLineDetails'`)
        res.json({apidata:apidata.recordset,interfacedata:interfacedata.recordset})//viewing the data which is array of obecjts which is json  
    } catch (error) {
        res.json(error.message)
    }
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
    // let SunUser = req.body.SunUser
    // let SunPassword = req.body.SunPassword
    // let Sunserver = req.body.Sunserver
    // let SunDatabase = req.body.SunDatabase
    const errors = validationResult(req);
   
    var hashApi =  CryptoJS.AES.encrypt(password, 'hashApi').toString()
    // var hashSun = CryptoJS.AES.encrypt(SunPassword, 'hashSun').toString()

  

    if (errors.isEmpty())
        try {
            //console.log(hashApi);
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
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
            // const dbConfig = {
            //     user: SunUser,
            //     password: SunPassword,
            //     server: Sunserver,
            //     database: SunDatabase,
            //     "options": {
            //     "abortTransactionOnError": true,
            //     "encrypt": false,
            //     "enableArithAbort": true,
            //     trustServerCertificate: true
            //     },
            //     charset: 'utf8'
            // };

            token=resp2.data.id_token
            let runtime;
            // let myDate=new Date(req.body.SunSchedule)
            // switch (req.body.SunScheduleStatue) {
            //     case "day": {//every hour
        
            //     let hour = req.body.SunSchedule.split(":")[0];
            //     let min = req.body.SunSchedule.split(":")[1];
            //     runtime = `0 ${min} ${hour} * * *`
            //     console.log(runtime);
            //     break;
            //     }
            //     case "year": {
            //     runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
            //     console.log(runtime);
        
            //     break;
            //     }
            //     case "month": {
            //     runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate() } * *`;
            //     console.log(runtime);
        
            //     break;
            //     }
            //     default:
            //     break;
            // }
            // req.body.SunSchedule=runtime
           
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
                    runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
                    console.log(runtime);
            
                    break;
                }
                case "apimonth": {
                    runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} * *`;
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
                //console.log(Object.keys(req.body)[j]);
                if(Object.keys(req.body)[j] == "password" ){
                    req.body[Object.keys(req.body)[j]]= hashApi
                }
                else if(Object.keys(req.body)[j] == "SunPassword" ){
                    req.body[Object.keys(req.body)[j]]= hashSun
                }
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
              
                if ((req.body[Object.keys(req.body)[j]] == null)) {
                    if((Object.keys(req.body)[j] != "SunPassword" && Object.keys(req.body)[j] != "password")){
                    check+=Object.keys(req.body)[j]+"=0 and "
                    }
                    data += "0,"
                   
                }
                else if (typeof (req.body[Object.keys(req.body)[j]]) == "number") {
                    if((Object.keys(req.body)[j] != "SunPassword" && Object.keys(req.body)[j] != "password")){

                    check+=Object.keys(req.body)[j]+"="+req.body[Object.keys(req.body)[j]] +" and "
                    }
                    data += req.body[Object.keys(req.body)[j]] + ","
                }
                else {
                    if((Object.keys(req.body)[j] != "SunPassword" &&  Object.keys(req.body)[j] != "password")){

                    check+=Object.keys(req.body)[j]+"="+"'"+req.body[Object.keys(req.body)[j]]+"'"+" and "
                     }

                    data += "'" + req.body[Object.keys(req.body)[j]] + "'" + ","
                }
            }
            // console.log(columns);
            // console.log(data);
            // console.log(check,"dd");
            // console.log(
            //     `IF NOT EXISTS (SELECT * FROM interfaceDefinition
            //         WHERE ${check.slice(0, -4)})
            //         BEGIN
            //         INSERT INTO interfaceDefinition (${columns}token,refreshToken)
            //         VALUES (${data}'${token}','${refresh_token}')
            //         END`);
        
            // console.log(check.slice(0, -4));
            const addCase = await request.query(
             `
                begin
                DECLARE @Isdublicate BIT
                IF NOT EXISTS (SELECT * FROM interfaceDefinition
                WHERE ${check.slice(0, -4)})
                BEGIN
                INSERT INTO interfaceDefinition (${columns}token,refreshToken)
                VALUES (${data}'${token}','${refresh_token}')
                END
                else
                begin
                SET @Isdublicate=0 
                SELECT @Isdublicate AS 'Isdublicate'
                end
                end`);
                const interfaceCode = await request.query(  `select max(interfaceCode) from interfaceDefinition`);
                console.log(addCase.recordset);
                if(addCase.recordset==undefined)
                    {await schedPush(req.body.ApiSchedule,req.body.ApiScheduleStatue,interfaceCode.recordset[0][""],req.body.lockRef,token)
                    res.json("Submitted successfully");}
                else
            //await request.query(`insert into interfaceDefinition (apiUserName,apiPassword,email,enterpriseShortName,clientId,lockRef,apiSchedule,sunUser,sunPassword,server,sunDatabase,sunSchedule,token,refreshToken,ApiScheduleStatue,SunScheduleStatue) VALUES ('${req.body.userName}','${req.body.password}','${req.body. email}','${req.body.enterpriseShortName}','${req.body.clientId}','${req.body.lockRef}','${req.body.ApiSchedule}','${req.body.SunUser}','${req.body.SunPassword}','${req.body.Sunserver}','${req.body.SunDatabase}','${req.body.SunSchedule}','${req.body.token}','${req.body.refresh_token}','${req.body.ApiScheduleStatue}','${req.body.SunScheduleStatue}')`);
                    res.json("Already\texists")
        } catch (error) {
            let x=[]
            if(error.message.includes(400))
                x.push("Invalid Client ID")
            if(error.message.includes(401)){
                x.push("Invalid username ,password or enterprise name")
            }
            if(error.message.includes('connect'))
                x.push(error.message)
            else  x.push(error.message)

            console.log(error.message);
            res.json({x})
        }
    else{
        console.log("asfasf",errors);
        res.json(errors)
    }
}
module.exports.sunAuthorization = async (req, res) => {
    console.log(req.body);
    let SunUser = req.body.SunUser
    let SunPassword = req.body.SunPassword
    let Sunserver = req.body.Sunserver
    let SunDatabase = req.body.SunDatabase
    let type = req.body.type
    const errors = validationResult(req);
    var hashSun = CryptoJS.AES.encrypt(SunPassword, 'hashSun').toString()
    if (errors.isEmpty())
        try {
            //console.log(hashApi);
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            let runtime;
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
                runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
                console.log(runtime);
        
                break;
                }
                case "month": {
                runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate() } * *`;
                console.log(runtime);
        
                break;
                }
                default:
                break;
            }
            req.body.SunSchedule=runtime
            let columns = ""
            let data = ""
            let check=""
            for (let j = 0; j < Object.keys(req.body).length; j++) {
                columns += Object.keys(req.body)[j] + ','
                //console.log(Object.keys(req.body)[j]);
                if(Object.keys(req.body)[j] == "password" ){
                    req.body[Object.keys(req.body)[j]]= hashApi
                }
                else if(Object.keys(req.body)[j] == "SunPassword" ){
                    req.body[Object.keys(req.body)[j]]= hashSun
                }
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
              
                if ((req.body[Object.keys(req.body)[j]] == null)) {
                    if((Object.keys(req.body)[j] != "SunPassword" && Object.keys(req.body)[j] != "password")){
                    check+=Object.keys(req.body)[j]+"=0 and "
                    }
                    data += "0,"
                   
                }
                else if (typeof (req.body[Object.keys(req.body)[j]]) == "number") {
                    if((Object.keys(req.body)[j] != "SunPassword" && Object.keys(req.body)[j] != "password")){

                    check+=Object.keys(req.body)[j]+"="+req.body[Object.keys(req.body)[j]] +" and "
                    }
                    data += req.body[Object.keys(req.body)[j]] + ","
                }
                else {
                    if((Object.keys(req.body)[j] != "SunPassword" &&  Object.keys(req.body)[j] != "password")){

                    check+=Object.keys(req.body)[j]+"="+"'"+req.body[Object.keys(req.body)[j]]+"'"+" and "
                     }

                    data += "'" + req.body[Object.keys(req.body)[j]] + "'" + ","
                }
            }
            // console.log(columns);
            // console.log(data);
            // console.log(check,"dd");
            // console.log(
            //     `IF NOT EXISTS (SELECT * FROM interfaceDefinition
            //         WHERE ${check.slice(0, -4)})
            //         BEGIN
            //         INSERT INTO interfaceDefinition (${columns}token,refreshToken)
            //         VALUES (${data}'${token}','${refresh_token}')
            //         END`);
        
            // console.log(check.slice(0, -4));
            const addCase = await request.query(
             `
                begin
                DECLARE @Isdublicate BIT
                IF NOT EXISTS (SELECT * FROM sunDefinition
                WHERE ${check.slice(0, -4)})
                BEGIN
                INSERT INTO sunDefinition (${columns.slice(0, -1)})
                VALUES (${data.slice(0, -1)})
                END
                else
                begin
                SET @Isdublicate=0 
                SELECT @Isdublicate AS 'Isdublicate'
                end
                end`);
                console.log(addCase.recordset);
                if(addCase.recordset==undefined)
                {
                    res.json("Submitted successfully");
                }
                else
            //await request.query(`insert into interfaceDefinition (apiUserName,apiPassword,email,enterpriseShortName,clientId,lockRef,apiSchedule,sunUser,sunPassword,server,sunDatabase,sunSchedule,token,refreshToken,ApiScheduleStatue,SunScheduleStatue) VALUES ('${req.body.userName}','${req.body.password}','${req.body. email}','${req.body.enterpriseShortName}','${req.body.clientId}','${req.body.lockRef}','${req.body.ApiSchedule}','${req.body.SunUser}','${req.body.SunPassword}','${req.body.Sunserver}','${req.body.SunDatabase}','${req.body.SunSchedule}','${req.body.token}','${req.body.refresh_token}','${req.body.ApiScheduleStatue}','${req.body.SunScheduleStatue}')`);
                    res.json("Already\texists")
        } catch (error) {
            let x=[] 
            x.push(error.message)
            console.log(error.message);
            res.json({x})
        }
    else{
        console.log("asfasf",errors);
        res.json(errors)
    }
}
// module.exports.update = async (req, res) => {
//    console.log(req.body);
//     //job.reschedule(req.body.ApiSchedule);
//     let resp;
//     let clientId=req.body.clientId
//     let username=req.body.username
//     let password=req.body.password
//     let orgname=req.body.enterpriseShortName
//     let SunUser = req.body.SunUser
//     let SunPassword = req.body.SunPassword
//     let Sunserver = req.body.Sunserver
//     let SunDatabase = req.body.SunDatabase
//     const errors = validationResult(req);
//     var hashApi =  CryptoJS.AES.encrypt(password, 'hashApi').toString()
//     var hashSun = CryptoJS.AES.encrypt(SunPassword, 'hashSun').toString()
//     if (errors.isEmpty())
//         try {
//             let sqlPool = await mssql.GetCreateIfNotExistPool(config)
//             let request = new sql.Request(sqlPool)
//             resp = await axios.post('https://mte4-ohra-idm.oracleindustry.com/oidc-provider/v1/oauth2/signin',qs.stringify({
//                 username, //gave the values directly for testing
//                 password,
//                 orgname
//             }), {
//                 headers: {
//                     // 'application/json' is the modern content-type for JSON, but some
//                     // older servers may use 'text/json'.
//                     // See: http://bit.ly/text-json
//                     'content-type': 'application/x-www-form-urlencoded',
//                     'Cookie': `client_id=${clientId};code_challenge=FlyjQEyPz6tRl-UKGjXCiumY4O6_bqHPkTGAtgTSOOg;code_challenge_method=S256;redirect_uri=apiaccount://callback;response_type=code;state=;`
//                 }
//             , withCredentials: true });
//             let redirectUrlCode=resp.data.redirectUrl.split('code')[1].substring(1)
//             let resp2 = await axios.post('https://mte4-ohra-idm.oracleindustry.com/oidc-provider/v1/oauth2/token',qs.stringify({
//                 scope: "openid", //gave the values directly for testing
//                 grant_type: "authorization_code",
//                 client_id: clientId,
//                 code_verifier: "UnIKXBl2u6Mj6B5Un45j07diPyIaBHjcWXt4DUfXc6U",
//                 code: redirectUrlCode,
//                 redirect_url: "apiaccount://callback"
//             }), {
//                 headers: {
//                     // 'application/json' is the modern content-type for JSON, but some
//                     // older servers may use 'text/json'.
//                     // See: http://bit.ly/text-json
//                     'content-type': 'application/x-www-form-urlencoded'
//                 }
//             , withCredentials: true });
//             const dbConfig = {
//                 user: SunUser,
//                 password: SunPassword,
//                 server: Sunserver,
//                 database: SunDatabase,
//                 "options": {
//                 "abortTransactionOnError": true,
//                 "encrypt": false,
//                 "enableArithAbort": true,
//                 trustServerCertificate: true
//                 },
//                 charset: 'utf8'
//             };
            
//             //console.log(request.connect(dbConfig),"kkk");

//             token=resp2.data.id_token
//             let runtime;
//             //console.log(token);
//             let myDate=new Date(req.body.SunSchedule)
//             switch (req.body.SunScheduleStatue) {
//                 case "day": {//every hour
        
//                 let hour = req.body.SunSchedule.split(":")[0];
//                 let min = req.body.SunSchedule.split(":")[1];
//                 console.log("hour",hour);
//                 console.log("min",min);
//                 runtime = `0 ${(min[0] == "0") ? min[1] :min} ${(hour[0] == "0") ? hour[1] :hour} * * *`
//                 console.log(runtime);
//                 break;
//                 }
//                 case "year": {
//                 runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
//                 console.log(runtime);
        
//                 break;
//                 }
//                 case "month": {
//                 runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} * *`;
//                 console.log(runtime);

//                 break;
//                 }
//                 default:
//                 break;
//             }
//             req.body.SunSchedule=runtime
//             myDate=new Date(req.body.ApiSchedule)
//             switch (req.body.ApiScheduleStatue) {
//                 case "apiday": {//every hour
//                 let hour = req.body.ApiSchedule.split(":")[0];
//                 let min = req.body.ApiSchedule.split(":")[1];
//                 runtime = `0 ${(min[0] == "0") ? min[1] :min} ${(hour[0] == "0") ? hour[1] :hour} * * *`
//                 console.log(runtime);
//                 break;
//                 }
//                 case "apiyear": {
//                 runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate()} ${myDate.getMonth() + 1} *`;
//                 console.log(runtime);
            
//                 break;
//                 }
//                 case "apimonth": {
//                 runtime = `0 ${myDate.getMinutes()} ${myDate.getHours()} ${myDate.getUTCDate() } * *`;
//                 console.log(runtime);
//                 break;
//                 }
//                 default:
//                 break;
//             }
//             req.body.ApiSchedule=runtime
//             let  refresh_token =resp2.data.refresh_token
//             let columns = ""
//             let data = ""
//             let check=""
//             for (let j = 0; j < Object.keys(req.body).length; j++) {
//                 console.log(req.body[Object.keys(req.body)[j]],"sss");
//                 if(Object.keys(req.body)[j] == "password" ){
//                     req.body[Object.keys(req.body)[j]]= hashApi
//                 }
//                 else if(Object.keys(req.body)[j] == "SunPassword" ){
//                     req.body[Object.keys(req.body)[j]]= hashSun
//                 }
//                 columns += Object.keys(req.body)[j] + ','
//                 // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
//                 if ((req.body[Object.keys(req.body)[j]] == null)) {
//                     check+=Object.keys(req.body)[j]+"=0 , "
//                     data += "0,"
//                 }
//                 else if (typeof (req.body[Object.keys(req.body)[j]]) == "number" && Object.keys(req.body)[j]!='interfaceCode') {
//                     check+=Object.keys(req.body)[j]+"="+req.body[Object.keys(req.body)[j]] +" , "
//                     data += req.body[Object.keys(req.body)[j]] + ","

//                 }
//                 else{
//                     if (Object.keys(req.body)[j]!='interfaceCode') {
//                         check+=Object.keys(req.body)[j]+"="+"'"+req.body[Object.keys(req.body)[j]]+"'"+" , "
//                     }
//                     data += "'" + req.body[Object.keys(req.body)[j]] + "'" + ","

//                 }
//             }
           
//             // console.log(columns);
//             // console.log(data);
//             // console.log(check,ss);
//            // console.log(check,hash);

//             console.log(
//                 `update  interfaceDefinition set ${check} token='${token}',refreshToken='${refresh_token}'
//                 where interfaceCode=${req.body.interfaceCode}`);
//             const addCase = await request.query(
//                 `update  interfaceDefinition set ${check} token='${token}',refreshToken='${refresh_token}'
//                 where interfaceCode=${req.body.interfaceCode}`);

//             scJop[req.body.interfaceCode].reschedule(req.body.ApiSchedule)
//             //await request.query(`insert into interfaceDefinition (apiUserName,apiPassword,email,enterpriseShortName,clientId,lockRef,apiSchedule,sunUser,sunPassword,server,sunDatabase,sunSchedule,token,refreshToken,ApiScheduleStatue,SunScheduleStatue) VALUES ('${req.body.userName}','${req.body.password}','${req.body. email}','${req.body.enterpriseShortName}','${req.body.clientId}','${req.body.lockRef}','${req.body.ApiSchedule}','${req.body.SunUser}','${req.body.SunPassword}','${req.body.Sunserver}','${req.body.SunDatabase}','${req.body.SunSchedule}','${req.body.token}','${req.body.refresh_token}','${req.body.ApiScheduleStatue}','${req.body.SunScheduleStatue}')`);
//             res.json("Submitted successfully");
//         } catch (error) {
//             let x=[]
//             console.log(error);
//             if(error.message.includes(400))
//                 x.push("Invalid Client ID")
//             if(error.message.includes(401)){
//                 x.push("Invalid username ,password or enterprise name")
//             }
//         else
//                 x.push(error)
//             res.json(x)
//         }
//     else
//         res.json(errors)
// }
module.exports.delete = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            console.log(req.body);
            //query to delete mapping data from Mapping table  in  database 
            const values = await request.query(`delete from Mapping where MappingType='${req.body.MappingType}' and Source='${req.body.Source}' and Target='${req.body.Target}'`);
            res.json(req.body)//viewing the data which is array of obecjts which is json 
        } catch (error) {
            res.json(error.message)
        }
    else{
        console.log(errors,req.body.Source);
        res.json(errors)
    }
}
module.exports.deleteInterface = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            //query to delete PropertySettings data from Mapping table  in  database 
            const values = await request.query(`delete from interfaceConnections where interfaceCode='${req.body.interfaceCode}'`);
            res.json("deleted successfully")//viewing the data which is array of obecjts which is json 
        } catch (error) {
            res.json(error.message)
        }
    else
        res.json(errors)
}
module.exports.reviewInterface = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            //query to review PropertySettings data from Mapping table  in  database 
            const values = await request.query(`select * from interfaceDefinition where interfaceCode='${req.body.interfaceCode}' `);
            res.json(values.recordset[0]);
        } catch (error) {
            res.json(error.message)
        }
    else
        res.json(errors)
}
module.exports.SysData = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        //used to establish connection between database and the middleware
        let data = []//an empty array used to push all column names with it's table name
        
        const tables = await request.query(`SELECT name FROM sys.Tables where name != 'interfaceDefinition' and name != 'MappingDefinition' and name != 'ImportStatus' and name != 'Mapping' and name != 'PropertySettings' and name != 'GuestChecksLineDetails' and name != 'License' and name != 'sundefinition' and name != 'capsConfig' and name != 'interfaceConnections' and name != 'GuestChecksLineDetails'`);//retrive all tables name
        console.log(tables);
        for (let i = 0; i < tables.recordset.length; i++) {//iterate over all the table names
            let x = {}//object that will hold each table name with it's columns
            //retrive all columns name
            const columns = await request.query(`SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('${tables.recordset[i].name}')`);
            x["TableName"] = tables.recordset[i].name// add an new element to the object with the table name
            x["ColumnNames"] = columns.recordset// add an new element to the object with an array of all the column name to that table
            data.push(x)//push the object to the array
        }
        //used to close the connection between database and the middleware
        res.json(data)//viewing the data which is array of obecjts which is json
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.stop = async (req, res) => {
    try {
        // let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        // let request = new sql.Request(sqlPool)
        // let interfaceCodes=await request.query("SELECT interfaceCode From interfaceDefinition")
        // interfaceCodes=interfaceCodes.recordset
        // let x;
        // for (let i = 0; i < interfaceCodes.length; i++) {
        //     console.log(interfaceCodes[i].interfaceCode ,req.body.interfaceCode);
        //     if (interfaceCodes[i].interfaceCode==req.body.interfaceCode) {
        //         x=i
        //     }
        // }
        scJop[req.body.interfaceCode+'api'].cancel()
        res.json("Schedule has stopped")
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.start = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        // let interfaceCodes=await request.query("SELECT interfaceCode From interfaceDefinition")
        let apiSch=await request.query(`SELECT ApiSchedule From interfaceDefinition where interfaceCode= ${req.body.interfaceCode}`)
        // interfaceCodes=interfaceCodes.recordset
        // let x;
        // for (let i = 0; i < interfaceCodes.length; i++) {
        //     console.log(interfaceCodes[i].interfaceCode ,req.body.interfaceCode);
        //     if (interfaceCodes[i].interfaceCode==req.body.interfaceCode) {
        //         x=i
        //     }
        // }
        scJop[req.body.interfaceCode+'api'].reschedule(apiSch.recordset[0].ApiSchedule)
        res.json("Schedule has started")
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.revenue = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        //used to establish connection between database and the middleware
        //retrive all num value from  RevenuCenter table
        const revenue = await request.query(`SELECT num FROM getRevenueCenterDimensions `);
        //used to close the connection between database and the middleware
        res.json(revenue.recordset)//viewing the data which is array of obecjts which is json 
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.SysDataHandler = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        //used to establish connection between database and the middleware
        //retrive a specific column values requested from the front end from a specific table
        const values = await request.query(`SELECT distinct ${req.body.column} FROM ${req.body.table}`);
    
        res.json(values.recordset)//viewing the data which is array of obecjts which is json 
    
        //used to close the connection between database and the middleware
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.getMapping = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        //used to establish connection between database and the middleware
        //retrive all mapping data from Mapping table in database
        const mapp = await request.query(`SELECT * FROM Mapping`);
        //used to close the connection between database and the middleware
        res.json(mapp.recordset)//viewing the data which is array of obecjts which is json 
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.postMapping = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            //to change the level and Revenue from empty string to null as it should be int 
            let counter=[]
            for (let i = 0; i < req.body.length; i++) {
                if (req.body[i].MappingType == 'Account') {
                    req.body[i].Level = null
                    req.body[i].RevenuCenter = null
                }
                //query to insert mapping data(mapp ,value,Revenue,level,inbut) into Mapping table  in  database 
            //const val = await request.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body.MappingCode}','${req.body.mapp}','${req.body.value}','${req.body.Revenue}','${req.body.level}','${req.body.input}')`);
            console.log(req.body);
            //  const values = await request.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body[i].MappingCode}','${req.body[i].MappingType}','${req.body[i].Source}','${req.body[i].RevenuCenter}','${req.body[i].Level}','${req.body[i].input}')`);
            const values = await request.query(
                `
                begin
                DECLARE @Isdublicate BIT
                IF NOT EXISTS (SELECT * FROM Mapping
                WHERE MappingCode='${req.body[i].MappingCode}' and locRef='${req.body[i].locRef}' and MappingType='${req.body[i].MappingType}' and Source='${req.body[i].Source}' and RevenuCenter='${req.body[i].RevenuCenter}' and ALevel='${req.body[i].Level}' and Target='${req.body[i].input}')
                BEGIN
                INSERT INTO Mapping (MappingCode,locRef,MappingType,Source,RevenuCenter,ALevel,Target)
                VALUES ('${req.body[i].MappingCode}','${req.body[i].locRef}','${req.body[i].MappingType}','${req.body[i].Source}','${req.body[i].RevenuCenter}','${req.body[i].Level}','${req.body[i].input}')
                END
                else
                begin
                SET @Isdublicate=0 
                SELECT @Isdublicate AS 'Isdublicate'
                end
                end`)
                if (values.recordset!=undefined) {
                    counter.push(i+1)
                }
            console.log(values);
            }
            const val = await request.query(
                `IF NOT EXISTS (SELECT * FROM MappingDefinition
                    WHERE MappingCode='${req.body[0].MappingCode}' and Description='${req.body[0].Description}')
                    BEGIN
                    INSERT INTO MappingDefinition (MappingCode,Description)
                    VALUES ('${req.body[0].MappingCode}','${req.body[0].Description}')
                    END`)
            // const val = await request.query(`insert into MappingDefinition (MappingCode,Description) VALUES  ('${req.body[0].MappingCode}','${req.body[0].Description}')`);
        
        
            //used to close the connection between database and the middleware
            console.log(counter,counter.length,counter.length!=0);
            if (counter.length!=0) {
                res.json("lines "+counter.join(",")+" already exists")
            }
            else
                res.json("Submited successfully")//viewing the data which is array of obecjts which is json 
        } catch (error) {
            console.log(error);
            res.json(error.message)
        }
    else
        res.json(errors)
}
// module.exports.PropertySettings = async (req, res) => {
//     const errors = validationResult(req);
//     if (errors.isEmpty())
//         try {
//             let sqlPool = await mssql.GetCreateIfNotExistPool(config)
//             let request = new sql.Request(sqlPool)
//             //used to establish connection between database and the middleware
//             //query to insert Property data(BU,JournalType,Revenue,level,Currencycode) into PropertySettings table in database 
//             // const values = await request.query(`insert into PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,ConnectionCode) VALUES  ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.ConnectionCode}')`);
//             console.log(
//                 `IF NOT EXISTS (SELECT * FROM PropertySettings
//                     WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
//                     BEGIN
//                     INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
//                     VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
//                     END`);
//             const values = await request.query(
//                 `IF NOT EXISTS (SELECT * FROM PropertySettings
//                     WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
//                     BEGIN
//                     INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
//                     VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
//                     END`)
        
        
//         const sunCon = await request.query(`SELECT SunUser,SunPassword,Sunserver,SunDatabase,SunSchedule From  interfaceDefinition where interfaceCode='${req.body.interfaceCode}' `);
//         await  request.close() 
//         console.log(sunCon,sunCon.recordset[0].SunSchedule);
//         let sunConuser =sunCon.recordset[0].SunUser;
//         let sunConSunPassword =sunCon.recordset[0].SunPassword
//         let sunConSunserver =sunCon.recordset[0].Sunserver
//         let sunConSunDatabase  =sunCon.recordset[0].SunDatabase
//         const dbConfig ={
//                 user:sunConuser,
//                 password: sunConSunPassword,
//                 server: sunConSunserver,
//                 database: sunConSunDatabase,
//                 "options": {
//                 "abortTransactionOnError": true,
//                 "encrypt": false,
//                 "enableArithAbort": true,
//                 trustServerCertificate: true
//                 },
//                 charset: 'utf8'
//             };
//             jobSun.reschedule(sunCon.recordset[0].SunSchedule)     
//             //await request.query(``)
//             await  request.close() 
//             //used to close the connection between database and the middleware
//             res.json(req.body)//viewing the data which is array of obecjts which is json
//         } catch (error) {
//             res.json(error.message)
            
//         }
//     else
//         res.json(errors)
// }
module.exports.getURL = async (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync('configuration/config.txt', 'utf8')).urlBackend)
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.statusData = async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        let data;
        console.log(req.body);
        if (req.body.date=="") {
            data =await request.query(`select * from ImportStatus order by Date desc`)
        }
        else{
            data =await request.query(`select * from ImportStatus where Date='${req.body.date}' order by Date desc`)
        }
        data=data.recordset
        res.json(data)
    } catch (error) {
        console.log(error);
        res.json(error.message)
    }
}
module.exports.test = async (req, res) => {
    try {
        asifjiasjf
    } catch (error) {
        console.log('bye');
    }
}
let myJson={
    curUTC: "2022-04-17T10:17:53",
    locRef: "CHGOUNA",
    guestChecks: [
    {
    guestCheckId: 85217246,
    chkNum: 6690,
    opnBusDt: "2022-03-27",
    opnUTC: "2022-03-27T13:39:16",
    opnLcl: "2022-03-27T15:39:16",
    clsdBusDt: "2022-03-27",
    clsdUTC: "2022-03-27T14:45:55",
    clsdLcl: "2022-03-27T16:45:55",
    lastUpdatedUTC: "2022-03-27T14:45:55",
    lastUpdatedLcl: "2022-03-27T16:45:55",
    clsdFlag: true,
    gstCnt: 5,
    subTtl: 1390.5,
    svcChgTtl: 166.86,
    nonTxblSlsTtl: null,
    chkTtl: 1775.39,
    dscTtl: -154.5,
    payTtl: 1775.39,
    balDueTtl: null,
    rvcNum: 1,
    otNum: 1,
    tblNum: 1,
    tblName: "4B",
    empNum: 20012,
    detailLines: [
    {
    guestCheckLineItemId: 528330988,
    lineNum: 2,
    dtlId: 2,
    detailUTC: "2022-03-27T13:40:54",
    detailLcl: "2022-03-27T15:40:54",
    busDt: "2022-03-27",
    wsNum: 1,
    dspTtl: 140,
    dspQty: 1,
    aggTtl: 140,
    aggQty: 1,
    chkEmpNum: 20012,
    svcRndNum: 1,
    menuItem: {
    miNum: 1002003,
    activeTaxes: "1",
    prcLvl: 1
    }
    }]}]}
let finalJson={}
// tree(myJson,finalJson)
// console.log(finalJson);
// console.log(finalJson);
token="eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwOWZmZGY4Yy1kMmEyLTQ1NDMtODgzNS1kMDhlZDI1MWE5NzciLCJhdWQiOiJWbEZETGpNMU16UXlOalJoTFRWbU9EQXRORGs1WXkwNE1qRTBMVEV6T0RReFpUYzNPVEl4Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDc5NDI4NjksImlhdCI6MTY0NjczMzI2OSwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Yd6mzoLh6kT7tfKKhLDuMyWAknuheZ9q1QFUwGK5bm4-XfY3n0J_UXQXTIBvjEzs5GNKNmpOitAjejhApNs-hXnUsrip8gebRCIKgTEZAZmBOUMYh57U0tAH8Mb5aBL6uJrE2wV2deNfJt8kpDXrPf7v8mNYV8Lgu6VunTchin6bXus5Kz2cPt6kixTWiikdPwSa_eXSaqsagvKLr4H9-ikNrkV9o9ttxsfSq_EEO2bosBYuibmQAbfGDwifQSssj3pVVrUhy0mqJ-gVd9wcPuoHIHVV55B7gLvjGWihM1irc5xMsRPWCWHzD068wPc8l012My_DdY4LfkzQGZPoFclApxWqy5htN6bmz6zIIITdFBgnKCkiRmupi6ZvlOn1OGYQvaZKRFwSAPHfPKi21RMjPt5spU6pFLAPDaQl53ds30JtRXk2zKVg_MuvaO4-Ve-TtOcohSDo0KvnEiBQvFNfrdXJ7xY8nqqFvQ6awqPKhU94s23uH26MqJh6IpaH"
// refreshToken(token)
// console.log(token);