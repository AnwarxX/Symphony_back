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
//this part is responsible for making the code work in a specific time automatically (now it runs every minute)
// const job = schedule.scheduleJob('0 * * * * *', async function () {
//     let dt = new Date();
//     dt.setHours(dt.getHours() + 2);
//     let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
//     // console.log(dat);
//     //await guestChecks(dat);
//     // await guestChecksDetails(dat);
// });

var status=[];
// let scJop=[]

// const job = schedule.scheduleJob('* * * * * *', async function () {
//     status = [];
//     let dt = new Date();
//     dt.setHours(dt.getHours() + 2);
//     let dat = new Date(dt.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
//     console.log(new Date());
//     //await guestChecks(dat, 10, 1);
//     //await allForOne(dat, 10, 1, 'getTaxDailyTotals', { "locRef": "CHGOUNA", "busDt": dat })
//     //await guestChecksDetails(dat, 10, 1);
//     //await TaxDailyTotal(dat, 10, 1)
//     //await ServiceChargeDailyTotals(dat, 10, 1)
//     //await DiscountDailyTotals(dat, 10, 1)
// });
// for (let i = 1; i < 6; i++) {
//     scJop[i] = schedule.scheduleJob('*/'+i+' * * * * *', async function () {
//         console.log(i,new Date());
//     })
// }

//these functions are responsible for retreving data from the APIs 
// async function guestChecks(dat) {
//     //used to establish connection between database and the middleware
//     await sql.connect(config)
//     // for (let i = 0; i < 8; i++) {
//     //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
//     //the data from the API
//     const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": dat }, {
//         headers: {
//             // 'application/json' is the modern content-type for JSON, but some
//             // older servers may use 'text/json'.
//             // See: http://bit.ly/text-json
//             'content-type': 'application/json',
//             'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
//         }
//     });
//     let oneForAll = resp.data.guestChecks
//     for (let i = 0; i < oneForAll.length; i++) {
//         let data = "'" + resp.data.locRef + "',";
//         let columns = "locRef,";
//         for (let j = 0; j < Object.keys(oneForAll[i]).length - 1; j++) {

//             if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
//                 data += "0,"
//             }
//             else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
//                 data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
//             }
//             else
//                 data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
//             columns += Object.keys(oneForAll[i])[j] + ","
//         }
//         console.log(columns);
//         console.log(data);
//        // const media = await sql.query(`delete from GuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
//     }
//     // }
// }

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
            for (let j = 0; j < Object.keys(oneForAll[i]).length - 1; j++) {

                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                columns += Object.keys(oneForAll[i])[j] + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            // const media = await sql.query(`INSERT INTO GuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
        if (res==undefined) {
            let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('guestChecks','${dat}','Successful')`);
        }
        status.push({API:"Guest Checks",date:dat,status:'success'})
        // res.json(oneForAll)
    } catch (error) {
        start++;
        console.log(error);
        if (start <= limit)
            setTimeout(function () {
                guestChecks(dat, limit, start,res);
            }, 3000);
        else {
            console.log(dat,"field");
            stats.push({API:"Guest Checks",date:dat,stats:'field'})
            if (res==undefined){
            // let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('guestChecks','${dat}','Not Successful')`);
            }
        }
        // }
    }
}
async function guestChecksDetails(dat, limit, start) {
    console.log("guestChecksDetails");
    await sql.connect(config)
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    try {
        for (let i = 0; i < 8; i++) {
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": dat }, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
                let data = "";
                let columns = "";
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                    columns += Object.keys(oneForAll[i])[j] + ","
                }
                console.log(columns.slice(0, -1, Object.keys(oneForAll[i]).length));
                console.log(data.slice(0, -1));
                // const addCase = await sql.query(`INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1).split(" ").join("")}) VALUES (${data.slice(0, -1)})`);
            }
        }
        let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('guestChecksDetails','${dat}','Successful')`);

        return await oneForAll;
    } catch (error) {
        start++;
        console.log(error);
        if (start <= limit)
            setTimeout(function () {
                guestChecksDetails(dat, limit, start);
            }, 300000);
        else {
            let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('guestChecksDetails','${dat}','Not Successful')`);

            console.log('stackoverflow');
        }
    }
}
async function TaxDailyTotal(dat, limit, start) {
    await sql.connect(config)
    try {
        for (let i = 0; i < 8; i++) {
            //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
            //the data from the API
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTaxDailyTotals', { "locRef": "CHGOUNA", "busDt": dat }, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    columns += Object.keys(oneForAll[i])[j] + ','
                    // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                }
                console.log(columns);
                console.log(data);
                // const addCase = await sql.query(`INSERT INTO TaxDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
        }
        let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('TaxDailyTotal','${dat}','Successful')`);

        return await oneForAll;
    } 
    catch (error) {
        start++;
        console.log(error);
        if (start <= limit)
            setTimeout(function () {
                TaxDailyTotal(dat, limit, start);
            }, 300000);
        else {
            let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('TaxDailyTotal','${dat}','Not Successful')`);

            console.log('stackoverflow');
        }
    }
}
async function tenderMediaDaily(dat, limit, start) {
    await sql.connect(config)
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    try {
    for (let i = 0; i < 8; i++) {
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTenderMediaDailyTotals', { "locRef": "CHGOUNA", "busDt": dat }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //const addCase = await sql.query(`INSERT INTO TaxDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('TaxDailyTotal','${dat}','Successful')`);

    return await oneForAll;
} 
catch (error) {
    start++;
    console.log(error);
    if (start <= limit)
        setTimeout(function () {
            TaxDailyTotal(dat, limit, start);
        }, 300000);
    else {
        let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('TaxDailyTotal','${dat}','Not Successful')`);

        console.log('stackoverflow');
    }
}
}
async function ServiceChargeDailyTotals(dat, limit, start) {
    await sql.connect(config)
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    try{
    for (let i = 0; i < 8; i++) {
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getServiceChargeDailyTotals', { "locRef": "CHGOUNA", "busDt": dat }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
          //  const addCase = await sql.query(`INSERT INTO ServiceChargeDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('ServiceChargeDailyTotals','${dat}','Successful')`);

    return await oneForAll;
} 
catch (error) {
    start++;
    console.log(error);
    if (start <= limit)
        setTimeout(function () {
            TaxDailyTotal(dat, limit, start);
        }, 300000);
    else {
        let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('ServiceChargeDailyTotals','${dat}','Not Successful')`);

        console.log('stackoverflow');
    }
}
}
async function DiscountDailyTotals(dat, limit, start) {
    await sql.connect(config)
    //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
    //the data from the API
    try {

    for (let i = 0; i < 8; i++) {
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getDiscountDailyTotals', { "locRef": "CHGOUNA", "busDt": dat }, {
            headers: {

                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //const addCase = await sql.query(`INSERT INTO DiscountDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('DiscountDailyTotals','${dat}','Successful')`);

    return await oneForAll;
} 
catch (error) {
    start++;
    console.log(error);
    if (start <= limit)
        setTimeout(function () {
            TaxDailyTotal(dat, limit, start);
        }, 300000);
    else {
        let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES ('DiscountDailyTotals','${dat}','Not Successful')`);

        console.log('stackoverflow');
    }
}
}
function getDaysArray(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};
appRoutes.get("/import", async (req, res) => {
    let dates=getDaysArray("2022-02-20","2022-02-23")
    await sql.connect(config)
    const media = await sql.query(``);
    for (let i = 0; i < dates.length; i++) {
        await guestChecks(dates[i].toISOString().split("T")[0], 10, 1,res);
    }
    // job.reschedule('* * * * * *')
    // getDaysArray("2022-02-20","2022-02-23")
  //  guestChecks("2022-02-23", 10, 1,res)
//   res.json("done")
})
appRoutes.get("/", async (req, res) => {
res.json(status)
})
async function allForOne(dat, limit, start, apiName, body, res) {
    await sql.connect(config)
    try {
            //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive
            //the data from the API
            const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/'+apiName, body, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'content-type': 'application/json',
                    'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
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
                for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                    columns += Object.keys(oneForAll[i])[j] + ','
                    // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                    if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                        data += "0,"
                    }
                    else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                        data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                    }
                    else
                        data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                }
                console.log(columns);
                console.log(data);
                // const addCase = await sql.query(`INSERT INTO ${apiName} (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
            }
            status.push({api:apiName,date:dat,stats:'success'})
            if (res==undefined) {
                // let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES (${apiName},'${dat}','Successful')`);
            }
    }
    catch (error) {
        start++;
        console.log(error);
        if (start <= limit)
            setTimeout(function () {
                allForOne(dat, limit, start, apiName, body, res);
            }, 3000);
        else {
            status.push({api:apiName,date:dat,stats:'field'})
            // let status = await sql.query(`INSERT INTO ImportStatus (ApiName,Date,Status) VALUES (${apiName},'${dat}','Not Successful')`);

            console.log('stackoverflow');
        }
    }
}
appRoutes.post("/authorization", async (req, res) => {
    console.log(req.body);
    job.reschedule(req.body.ApiSchedule);
    let resp;
    let clientId=req.body.clientId
    let username=req.body.userName
    let password=req.body.password
    let orgname=req.body.enterpriseShortName
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
        token=resp2.data.id_token
        res.json("Submitted successfully");
    } catch (error) {
        if(error.message.includes(400))
            res.json("Invalid Client ID")
        else if(error.message.includes(401)){
            res.json("Invalid username ,password or enterprise name")
        }
    }
})
appRoutes.post('/delete', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    console.log(req.body);
    //query to delete mapping data from Mapping table  in  database 
    const values = await sql.query(`delete from Mapping where MappingType='${req.body.MappingType}' and Source='${req.body.Source}' and Target='${req.body.Target}'`);
    res.json(req.body)//viewing the data which is array of obecjts which is json 
});
//this endpoint used to retrive all the tables name and their columns
appRoutes.get('/SysData', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    let data = []//an empty array used to push all column names with it's table name
    const tables = await sql.query(`SELECT name FROM sys.Tables  where name != `);//retrive all tables name
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
});
appRoutes.get("/stop", async (req, res) => {
    job.cancel();
    res.json("stopped")
})
appRoutes.get("/start", async (req, res) => {
    job.reschedule('* * * * * *');
    res.json("started") 
})
// this endpoint used to retrive all num value from  RevenuCenter table
appRoutes.get('/revenue', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive all num value from  RevenuCenter table
    const revenue = await sql.query(`SELECT num FROM RevenuCenter `);
    //used to close the connection between database and the middleware
    res.json(revenue.recordset)//viewing the data which is array of obecjts which is json 

});
//this endpoint used to send data(table name and column name) from frontend to search in database and get all column values 
appRoutes.post('/SysDataHandler', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive a specific column values requested from the front end from a specific table
    const values = await sql.query(`SELECT distinct ${req.body.column} FROM ${req.body.table}`);

    res.json(values.recordset)//viewing the data which is array of obecjts which is json 

    //used to close the connection between database and the middleware
});
// this endpoint used to retrive all mapping data from Mapping table in database
appRoutes.get('/mapping', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //retrive all mapping data from Mapping table in database
    const mapp = await sql.query(`SELECT * FROM Mapping`);
    //used to close the connection between database and the middleware
    res.json(mapp.recordsets[0])//viewing the data which is array of obecjts which is json 

});
//this endpoint used to send mapping data(mapp ,value,Revenue,level,inbut) from frontend and insert it in  database 
appRoutes.post('/mapping', async (req, res) => {
    
    //used to establish connection between database and the middleware
    await sql.connect(config)
    console.log(req.body);
    //to change the level and Revenue from empty string to null as it should be int 
    if (req.body.mapp == 'Account') {
        req.body.level = null
        req.body.Revenue = null
    }
    for (let i = 0; i < req.body.length; i++) {
        if (req.body[i].mapp == 'Account') {
            req.body[i].level = null
            req.body[i].Revenue = null
        }
          //query to insert mapping data(mapp ,value,Revenue,level,inbut) into Mapping table  in  database 
    //const val = await sql.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body.MappingCode}','${req.body.mapp}','${req.body.value}','${req.body.Revenue}','${req.body.level}','${req.body.input}')`);

     const values = await sql.query(`insert into Mapping (MappingCode,MappingType,Source,RevenuCenter,ALevel,Target) VALUES  ('${req.body[i].MappingCode}','${req.body[i].mapp}','${req.body[i].value}','${req.body[i].Revenue}','${req.body[i].level}','${req.body[i].input}')`);
 
    }
   



    //used to close the connection between database and the middleware
    res.json(req.body)//viewing the data which is array of obecjts which is json 
});
//this endpoint used to send  Property data(BU,JournalType,Revenue,level,Currencycode) from frontend and insert it in  database 
appRoutes.post('/PropertySettings', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //query to insert Property data(BU,JournalType,Revenue,level,Currencycode) into PropertySettings table in database 
    const values = await sql.query(`insert into PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,ConnectionCode) VALUES  ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.ConnectionCode}')`);
    //used to close the connection between database and the middleware
    res.json(req.body)//viewing the data which is array of obecjts which is json
});
//schedule endpoint

appRoutes.get('/guestChecks', async (req, res) => {
    let con = false
    let cun = 0
    let x;
    let dateArray=[]
    while (con == false) {
        console.log(cun);
        let x = await guestChecks("2022-02-15")
        if (x == 'error') {
            console.log("error");
            cun++;
            if (cun == 5) {
                con = true
                res.json(x)
            }
        }
        else {
            con = true
            res.json(x)
        }
        await timer(3000);
    }
    console.log(x);
});
//this endpoint is used to retrive all the guest checks for s specified location refrence and bussiness date

appRoutes.get('/guestChecks', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 6; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": date.addDays(new Date("2022-02-7"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        // here we asign the response data to a variable called oneforall
        let oneForAll = resp.data.guestChecks
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let data = "'" + resp.data.locRef + "',";
            let columns = "locRef,";
            for (let j = 0; j < Object.keys(oneForAll[i]).length - 1; j++) {

                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                columns += Object.keys(oneForAll[i])[j] + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            //const media = await sql.query(`INSERT INTO getGuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data
});
//this endpoint is used to retrive all the guest checks lines details for  specified location refrence and bussiness date
appRoutes.get('/guestChecksDB', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 6; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": "2022-02-09", "opnBusDt": "2022-02-09" }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        let oneForAll = resp.data.guestChecks
        for (let i = 0; i < oneForAll.length; i++) {
            let data = "'" + resp.data.locRef + "',";
            let columns = "locRef,";
            for (let j = 0; j < Object.keys(oneForAll[i]).length - 1; j++) {

                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                columns += Object.keys(oneForAll[i])[j] + ","
            }
            console.log(columns);
            console.log(data);
            // const media = await sql.query(`INSERT INTO getGuestChecks (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }

    res.json(oneForAll)// text/json
});
//this endpoint is used to retrive all the guest checks lines details for  specified location refrence and bussiness date
appRoutes.get('/guestChecksDetails', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getGuestChecks', { "locRef": "CHGOUNA", "clsdBusDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.guestChecks.length; i++) {
            //this loops iterates over all the datial lines in each row
            for (let j = 0; j < resp.data.guestChecks[i].detailLines.length; j++) {
                let one = {}//this empty object was created to get the sub objects from the detail lines in a single object
                one["guestCheckId"] = resp.data.guestChecks[i].guestCheckId//save the uniqe id with the object
                //here to check if the value of a key in details line contains an object or not cuz if it does it will be addaed as a 
                //key and value not as a sub object
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
                oneForAll.push(one);//then push the reulted object in the oneforall array

            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let data = "";
            let columns = "";
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
                columns += Object.keys(oneForAll[i])[j] + ","
            }
            console.log(columns.slice(0, -1, Object.keys(oneForAll[i]).length));
            console.log(data.slice(0, -1));
            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO GuestChecksLineDetails (${columns.slice(0, -1).split(" ").join("")}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data

});
//this endpoint is used to retrive all the menu item price for specified location refrence and effiective date
appRoutes.get('/MenuItemPrices', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    // for (let i = 0; i < 8; i++) {
    //request is sent with a body includes location refrence , effiective date and a header containing the authorization token to retrive 
    //the data from the API
    const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getMenuItemPrices', { "locRef": "CHGOUNA", "effFrDt": "2022-01-01" }, {
        headers: {
            // 'application/json' is the modern content-type for JSON, but some
            // older servers may use 'text/json'.
            // See: http://bit.ly/text-json
            'content-type': 'application/json',
            'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
        }
    });
    // here we asign the response data to a variable called oneforall
    let oneForAll = resp.data.menuItemPrices
    //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
    //the column names in a variable called columns then insert them in the table
    for (let i = 0; i < oneForAll.length; i++) {
        let data = "'" + resp.data.locRef + "',";
        let columns = "locRef,";
        for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {

            if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                data += "0,"
            }
            else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
            }
            else
                data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            columns += Object.keys(oneForAll[i])[j] + ","
        }
        console.log(columns);
        console.log(data);
        //this query is used to insert the vales in thier columns
        const media = await sql.query(`INSERT INTO MenuItemPrices (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
    }
    // }

    res.json(resp.data)//viewing the data
});
//this endpoint is used to retrive all the tender media for specified location refrence
appRoutes.get('/TenderMedia', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    // for (let i = 0; i < 8; i++) {
    //request is sent with a body includes location refrence and a header containing the authorization token to retrive 
    //the data from the API
    const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTenderMediaDimensions', { "locRef": "CHGOUNA" }, {
        headers: {
            // 'application/json' is the modern content-type for JSON, but some
            // older servers may use 'text/json'.
            // See: http://bit.ly/text-json
            'content-type': 'application/json',
            'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
        }
    });
    // here we asign the response data to a variable called oneforall
    let oneForAll = resp.data.tenderMedias
    //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
    //the column names in a variable called columns then insert them in the table
    for (let i = 0; i < oneForAll.length; i++) {
        let data = "'" + resp.data.locRef + "',";
        let columns = "locRef,";
        for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {

            if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                data += "0,"
            }
            else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
            }
            else
                data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            columns += Object.keys(oneForAll[i])[j] + ","
        }
        console.log(columns);
        console.log(data);
        //this query is used to insert the vales in thier columns
        const media = await sql.query(`INSERT INTO TenderMedia (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
    }
    // }

    res.json(resp.data.tenderMedias)//viewing the data
})
//this endpoint is used to retrive all the menu item for  specified location refrence
appRoutes.get('/MenuItem', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //request is sent with a body includes location refrence and a header containing the authorization token to retrive 
    //the data from the API
    const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getMenuItemDimensions', { "locRef": "CHGOUNA" }, {
        headers: {
            // 'application/json' is the modern content-type for JSON, but some
            // older servers may use 'text/json'.
            // See: http://bit.ly/text-json
            'content-type': 'application/json',
            'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
        }
    });
    // here we asign the response data to a variable called oneforall
    let oneForAll = resp.data.menuItems
    for (let i = 0; i < oneForAll.length; i++) {
        let data = "'" + resp.data.locRef + "',";
        let columns = "locRef,";
        for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {

            if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                data += "0,"
            }
            else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
            }
            else
                data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            columns += Object.keys(oneForAll[i])[j] + ","
        }
        console.log(columns);
        console.log(data);
        //this query is used to insert the vales in thier columns
        const media = await sql.query(`INSERT INTO MenuItems (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
    }

    res.json(oneForAll)//viewing the data
});
//this endpoint is used to retrive all the TaxDailyTotal for  specified location refrence and bussiness date
appRoutes.get('/TaxDailyTotal', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTaxDailyTotals', { "locRef": "CHGOUNA", "busDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        //initialize array called oneForAll
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.revenueCenters.length; i++) {
            //this loops iterates over all  keys in each row
            for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                ////this loops to get location refrence ,business date,Revenue Center  first 
                for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                    let obj = {}//this empty object was created to get the sub objects from the detail lines in a single object
                    obj["locRef"] = resp.data.locRef //save the location refrence  with the object
                    obj["busDt"] = resp.data.busDt //save the business date  with the object
                    obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum //save the RevenueCenter with the object
                    //this loops iterates over all the datial lines in each row
                    for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                        //  console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                        obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                    }
                    oneForAll.push(obj)//then push the reulted object in the oneForAll array
                }
            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let columns = ""
            let data = ""
            // this loop iterates over all the rows keys in the variable oneforall
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                //if condation to check if the rows value of keyes is null the value will be 0
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                //else if type of the rows value of keye is number we dont need to change the value before insert it to database 
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                //else if type of the rows value of keye is string  we  need to change the value as it should be inside single quotations
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            //console.log(columns);
            //console.log(data);

            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO TaxDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data 
});
//this endpoint is used to retrive all the tenderMediaDaily for  specified location refrence and bussiness date
appRoutes.get('/tenderMediaDaily', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTaxDailyTotals', { "locRef": "CHGOUNA", "busDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        //initialize array called oneForAll
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.revenueCenters.length; i++) {
            //this loops iterates over all  keys in each row
            for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                //this loops to get value of location refrence ,business date,RevenueCenter first 
                for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                    let obj = {} //this empty object was created to get the sub objects from the detail lines in a single object
                    obj["locRef"] = resp.data.locRef
                    obj["busDt"] = resp.data.busDt
                    obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum
                    //this loops iterates over all the datial lines in each row
                    for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                        // console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                        obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                    }
                    oneForAll.push(obj)//then push the reulted object in the oneForAll array
                }
            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let columns = ""
            let data = ""
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO TaxDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data
});
//this endpoint is used to retrive all the ServiceChargeDailyTotals for  specified location refrence and bussiness date
appRoutes.get('/ServiceChargeDailyTotals', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getServiceChargeDailyTotals', { "locRef": "CHGOUNA", "busDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        //initialize array called oneForAll
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.revenueCenters.length; i++) {
            //this loops iterates over all  keys in each row
            for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                //this loops to get value of location refrence ,business date,RevenueCenter first 
                for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                    let obj = {}//this empty object was created to get the sub objects from the detail lines in a single object
                    obj["locRef"] = resp.data.locRef //save the location refrence  with the object
                    obj["busDt"] = resp.data.busDt //save the business date  with the object
                    obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum //save the RevenueCenter with the object
                    //this loops iterates over all the datial lines in each row
                    for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                        //console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                        obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                    }
                    oneForAll.push(obj)//then push the reulted object in the oneForAll array
                }
            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let columns = ""
            let data = ""
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO ServiceChargeDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data 
});
//this endpoint is used to retrive all the DiscountDailyTotals for  specified location refrence and bussiness date
appRoutes.get('/DiscountDailyTotals', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getDiscountDailyTotals', { "locRef": "CHGOUNA", "busDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        //initialize array called oneForAll
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.revenueCenters.length; i++) {
            //this loops iterates over all  keys in each row
            for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                //this loops to get value of location refrence ,business date,RevenueCenter first 
                for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                    let obj = {}//this empty object was created to get the sub objects from the detail lines in a single object
                    obj["locRef"] = resp.data.locRef //save the location refrence  with the object
                    obj["busDt"] = resp.data.busDt //save the business date  with the object
                    obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum //save the RevenueCenter with the object
                    //this loops iterates over all the datial lines in each row
                    for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                        //console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                        obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                    }
                    oneForAll.push(obj)//then push the reulted object in the oneForAll array
                }
            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let columns = ""
            let data = ""
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO DiscountDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(resp.data)//viewing the data 
});
//this endpoint is used to retrive all the RevenueCenter for  specified location refrence 
appRoutes.get('/RevenueCenter', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //request is sent with a body includes location refrence and a header containing the authorization token to retrive 
    //the data from the API
    const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getRevenueCenterDimensions', { "locRef": "CHGOUNA" }, {
        headers: {
            // 'application/json' is the modern content-type for JSON, but some
            // older servers may use 'text/json'.
            // See: http://bit.ly/text-json
            'content-type': 'application/json',
            'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
        }
    });
    // here we asign the response data to a variable called oneforall
    let oneForAll = resp.data.revenueCenters
    //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
    //the column names in a variable called columns then insert them in the table
    for (let i = 0; i < oneForAll.length; i++) {
        let data = "'" + resp.data.locRef + "',";
        let columns = "locRef,";
        for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {

            if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                data += "0,"
            }
            else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
            }
            else
                data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            columns += Object.keys(oneForAll[i])[j] + ","
        }
        console.log(columns);
        console.log(data);
        //this query is used to insert the vales in thier columns
        const media = await sql.query(`INSERT INTO RevenuCenter (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);

    }
    res.json(oneForAll)//viewing the data 
});
//this endpoint is used to retrive all the getTaxs for  specified location refrence 
appRoutes.get('/getTaxs', async (req, res) => {
    //this endpoint is used to retrive all the guest checks for s specified location refrence and bussiness date
    await sql.connect(config)
    //request is sent with a body includes location refrence  and a header containing the authorization token to retrive 
    //the data from the API
    const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getTaxDimensions', { "locRef": "CHGOUNA" }, {
        headers: {
            // 'application/json' is the modern content-type for JSON, but some
            // older servers may use 'text/json'.
            // See: http://bit.ly/text-json
            'content-type': 'application/json',
            'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
        }
    });
    // here we asign the response data to a variable called oneforall
    let oneForAll = resp.data.taxes
    //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
    //the column names in a variable called columns then insert them in the table
    for (let i = 0; i < oneForAll.length; i++) {
        let data = "'" + resp.data.locRef + "',";
        let columns = "locRef,";
        for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {

            if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                data += "0,"
            }
            else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
            }
            else
                data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            columns += Object.keys(oneForAll[i])[j] + ","
        }
        console.log(columns);
        console.log(data);
        //this query is used to insert the vales in thier columns
        const media = await sql.query(`INSERT INTO Taxes (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
    }

    res.json(oneForAll)//viewing the data 
});
//this endpoint is used to retrive all the getLocationDimensions for  specified location refrence and bussiness date
appRoutes.get('/getLocationDimensions', async (req, res) => {
    //used to establish connection between database and the middleware
    await sql.connect(config)
    //this loop itrates for more 8 days from the date that was sent in the equest
    for (let i = 0; i < 8; i++) {
        //request is sent with a body includes location refrence and business date and a header containing the authorization token to retrive 
        //the data from the API
        const resp = await axios.post('https://mte4-ohra.oracleindustry.com/bi/v1/VQC/getLocationDimensions', { "locRef": "CHGOUNA", "busDt": date.addDays(new Date("2022-01-30"), i).toISOString().split("T")[0] }, {
            headers: {
                // 'application/json' is the modern content-type for JSON, but some
                // older servers may use 'text/json'.
                // See: http://bit.ly/text-json
                'content-type': 'application/json',
                'Authorization': 'Bearer eyJraWQiOiJiMGE0M2ExNy1iNDViLTQ5YzMtODc5Yy1kMDNlOTk3M2NlOWUiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwYzE3MzY3ZS1lMjUwLTRhYWUtOTJjZC1kMTU4ZTgyZGI0MGMiLCJhdWQiOiJWbEZETG1Nd01tTmhaRGMzTFRoaFlqVXROR016WXkxaFpHRTVMV1poT0dKaE56bGtPRGM1Wmc9PSIsImlzcyI6Imh0dHBzOlwvXC93d3cub3JhY2xlLmNvbVwvaW5kdXN0cmllc1wvaG9zcGl0YWxpdHlcL2Zvb2QtYmV2ZXJhZ2UiLCJleHAiOjE2NDYxMjcwMzAsImlhdCI6MTY0NDkxNzQzMCwidGVuYW50IjoiMDhhMzFhN2QtYTQ5Yi00ZTYxLWE0NzgtOGFiYmVlYTc2Yjc2In0.Ruvt3wxqpYn_qTJhX23_4f-nstXGScj6i9p8n5QPmv4fYFgTdPV2YFIht44KDKfTL0D61RPQih1Rso8e0JcnLoGprvddN0WpjBK-JpXWRwAjVg-zeYwDJx5Y3tn5LStrZj-uz3fxITMsLj7Ls8FqDV0VXkLIBu8IWK77KPkZE_9Daj8sLkCbJzwNZVoK-f5K4D1jPQLKMzpLP1l6Fmor1jAuUw2tGBJ2KcJrx1FTHhh8CHwN5pOGpiCVfa-_7EByOHauTygjVkPMHEFHvEvz7V6F85w0GxVAaeGzHM-z5P0FoPw0X7YrFioHhIttbcF1leg3GFFEkWXHssYDvJGlkVZ8PU9L5XBXpa8Y4K6AtE6Er94A4f-FaI7XMojEKY2QQu2cytppedJgufa6L0jfmNMheqBtdKlFw8HG7nvdzftuKHOmbVAOW_Og_gi4i32dKjNNurmkyz8CAlpgg19wlS5Sdt-a6DvefTwBNzDUjOJLIwaDTaPidXWiT9-0Ls7d'
            }
        });
        //initialize array called oneForAll
        let oneForAll = []
        //this loops iterates over all the rows retrived from the API
        for (let i = 0; i < resp.data.revenueCenters.length; i++) {
            //this loops iterates over all  keys in each row
            for (let j = 0; j < Object.keys(resp.data.revenueCenters[i]).length; j++) {
                //this loops to get value of location refrence ,business date,RevenueCenter first 
                for (let k = 0; k < resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]].length; k++) {
                    let obj = {}//this empty object was created to get the sub objects from the detail lines in a single object
                    obj["locRef"] = resp.data.locRef //save the location refrence  with the object
                    obj["busDt"] = resp.data.busDt //save the business date  with the object
                    obj["rvcNum"] = resp.data.revenueCenters[i].rvcNum //save the RevenueCenter with the object
                    //this loops iterates over all the datial lines in each row
                    for (let f = 0; f < Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k]).length; f++) {
                        //console.log(Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]);
                        obj[Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]] = resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k][Object.keys(resp.data.revenueCenters[i][Object.keys(resp.data.revenueCenters[i])[j]][k])[f]]
                    }
                    oneForAll.push(obj)//then push the reulted object in the oneForAll array
                }
            }
        }
        //this loop iterates over all the rows in the variable oneforall and concatinate all the values in a variable called data and all 
        //the column names in a variable called columns then insert them in the table
        for (let i = 0; i < oneForAll.length; i++) {
            let columns = ""
            let data = ""
            for (let j = 0; j < Object.keys(oneForAll[i]).length; j++) {
                columns += Object.keys(oneForAll[i])[j] + ','
                // data+=oneForAll[i][Object.keys(oneForAll[i])[j]]+','
                if ((oneForAll[i][Object.keys(oneForAll[i])[j]] == null)) {
                    data += "0,"
                }
                else if (typeof (oneForAll[i][Object.keys(oneForAll[i])[j]]) == "number") {
                    data += oneForAll[i][Object.keys(oneForAll[i])[j]] + ","
                }
                else
                    data += "'" + oneForAll[i][Object.keys(oneForAll[i])[j]] + "'" + ","
            }
            console.log(columns);
            console.log(data);
            //this query is used to insert the vales in thier columns
            const addCase = await sql.query(`INSERT INTO ServiceChargeDailyTotals (${columns.slice(0, -1)}) VALUES (${data.slice(0, -1)})`);
        }
    }
    res.json(oneForAll)//viewing the data 
});
//use module.exports to give access to any part of this app to access this route data 
module.exports = appRoutes;