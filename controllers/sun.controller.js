// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); 
const { check, validationResult } = require('express-validator')
//call for Router method inside express module to give access for any endpoint
//Axios allows us to make HTTP requests (post & get). 
const axios = require('axios');//call for using xios module
const sql = require('mssql')//call for using sql module
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
let mssql = require('../configuration/mssql-pool-management.js')
//node-schedule allows us to schedule jobs (arbitrary functions) for execution at specific dates/time.
const schedule = require('node-schedule');
const date = require('date-and-time');//call for using date-and-time module 
const { response } = require('express');
const qs = require("qs")
var status = [];
const jobSun = schedule.scheduleJob('* * * * * *', async function () {
    status = [];
    let dt = new Date();
    dt.setHours(dt.getHours() + 2);
    let dat = new Date(dt.getTime()).toISOString().split("T")[0]
    SUN(res, dat, req);

    const dbConfig = {
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
    let sqlPool = await mssql.GetCreateIfNotExistPool(dbConfig)
    let request = new sql.Request(sqlPool)
    let token = await request.query(`SELECT 1 FROM ACT_ACNT`);
    // console.log(token);
    // console.log("-----------------------------------------------------------");
});
jobSun.cancel();

module.exports.stop = async (req, res) => {
    try {
        jobSun.cancel();
        res.json("stopped")
    } catch (error) {
        res.json(error.message)
    }
}
module.exports.start = async (req, res) => {// dont forget to make this function for real
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(config)
        let request = new sql.Request(sqlPool)
        const addCase = await request.query(`SELECT SunSchedule FROM interfaceDefinition WHERE interfaceCode=43`);
        jobSun.reschedule(addCase.recordset[0].SunSchedule);
        res.json("done")
    } catch (error) {
        res.json(error.message)
    }
}
async function SUN(res, dat, req) {
    try {
        console.log(req.body);
        let sqlPoolAPI = await mssql.GetCreateIfNotExistPool(config)
        let requestAPI = new sql.Request(sqlPool)
        if (req == undefined) {
            req = {
                body: {
                    interfaceCod: "43",
                    date: dat
                }
            }
        }
        const sunCon = await requestAPI.query(`SELECT SunUser,SunPassword,Sunserver,SunDatabase,SunSchedule From  interfaceDefinition where interfaceCode=${req.body.interfaceCod} `);
        const buD = await requestAPI.query(`SELECT BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,MappingCode from PropertySettings where interfaceCode=${req.body.interfaceCod}`)
        let MappingCode = buD.recordset[0].MappingCode
        let pk1 = buD.recordset[0].BU
        let SuspenseAccount = buD.recordset[0].SuspenseAccount
        let JournalType = buD.recordset[0].JournalType
        let Currencycode = buD.recordset[0].Currencycode
        let LedgerImportDescription = buD.recordset[0].LedgerImportDescription
        let data = await request.query(`select Main.Account , Main.Reference , Main.Total , Main.rvcNum ,Main.TransactionDate, Main.Period , isnull(T01.Target,'#') 'T01' , isnull(T02.Target,'#') 'T02' 
    ,isnull(T03.Target,'#') 'T03'
    ,isnull(T04.Target,'#') 'T04'
    ,isnull(T05.Target,'#') 'T05'
    ,isnull(T06.Target,'#') 'T06'
    ,isnull(T07.Target,'#') 'T07'
    ,isnull(T08.Target,'#') 'T08'
    ,isnull(T09.Target,'#') 'T09'
    ,isnull(T10.Target,'#') 'T10'
    
    from 
    (select Main.Reference , Acc.Target 'Account', sum(Main.Total) 'Total', Main.rvcNum , Main.busDt 'TransactionDate' , ltrim(Year(Main.busDt))+RIGHT('000'+ ltrim(MONTH(Main.busDt)),3) 'Period' from VIEW_JV_MAIN Main
    left join Mapping Acc on Main.Reference = Acc.Source and Acc.MappingType = 'Account' and Acc.MappingCode = '${MappingCode}'
    
    where Main.busDt = '${req.body.date}'
    group by Main.Reference,Main.rvcNum , Main.busDt , Acc.Target
    ) as Main
    
    left join Mapping as T01 on Main.Reference = T01.Source and Main.rvcNum = T01.RevenuCenter and T01.ALevel = 1 and T01.MappingCode = '${MappingCode}'
    left join Mapping as T02 on Main.Reference = T02.Source and Main.rvcNum = T02.RevenuCenter and T02.ALevel =  2  and T02.MappingCode = '${MappingCode}'
    left join Mapping as T03 on Main.Reference = T03.Source and Main.rvcNum = T03.RevenuCenter and T03.ALevel =  3  and T03.MappingCode = '${MappingCode}'
    left join Mapping as T04 on Main.Reference = T04.Source and Main.rvcNum = T04.RevenuCenter and T04.ALevel =  4  and T04.MappingCode = '${MappingCode}'
    left join Mapping as T05 on Main.Reference = T05.Source and Main.rvcNum = T05.RevenuCenter and T05.ALevel =  5  and T05.MappingCode = '${MappingCode}'
    left join Mapping as T06 on Main.Reference = T06.Source and Main.rvcNum = T06.RevenuCenter and T06.ALevel =  6  and T06.MappingCode = '${MappingCode}'
    left join Mapping as T07 on Main.Reference = T07.Source and Main.rvcNum = T07.RevenuCenter and T07.ALevel =  7  and T07.MappingCode = '${MappingCode}'
    left join Mapping as T08 on Main.Reference = T08.Source and Main.rvcNum = T08.RevenuCenter and T08.ALevel =  8  and T08.MappingCode = '${MappingCode}'
    left join Mapping as T09 on Main.Reference = T09.Source and Main.rvcNum = T09.RevenuCenter and T09.ALevel =  9  and T09.MappingCode = '${MappingCode}'
    left join Mapping as T10 on Main.Reference = T10.Source and Main.rvcNum = T10.RevenuCenter and T10.ALevel =  10  and T10.MappingCode = '${MappingCode}'`)
        data = data.recordset
        console.log(data, LedgerImportDescription, MappingCode);
        const dbConfig = {
            user: sunCon.recordset[0].SunUser,
            password: sunCon.recordset[0].SunPassword,
            server: sunCon.recordset[0].Sunserver,
            database: sunCon.recordset[0].SunDatabase,
            "options": {
                "abortTransactionOnError": true,
                "encrypt": false,
                "enableArithAbort": true,
                trustServerCertificate: true
            },
            charset: 'utf8'
        };
        let sqlPool = await mssql.GetCreateIfNotExistPool(dbConfig)
        let request = new sql.Request(sqlPool)
        // let HDR_I = await sql.query(`SELECT max(PSTG_HDR_ID) FROM ${pk1}_PSTG_HDR where  DESCR='HRMS'`)
        // console.log(HDR_I);
        //                    HDR_I = HDR_I.recordsets[0].PSTG_HDR_ID;
        await request.query(`
        
        IF NOT EXISTS (SELECT * FROM ${pk1}_PSTG_HDR
            WHERE  LAST_CHANGE_DATETIME = GETDATE() )
            BEGIN
        insert into  ${pk1}_PSTG_HDR (UPDATE_COUNT,
            LAST_CHANGE_USER_ID,
            LAST_CHANGE_DATETIME
            ,CREATED_BY,
            CREATED_DATETIME,
            CREATION_TYPE,
            DESCR ,
            LAST_STATUS ,
            POST_TYPE
            ,POST_WRITE_TO_HOLD,
            POST_ROUGH_BOOK ,
            POST_ALLOW_BAL_TRANS,
            POST_SUSPENSE_ACNT,
            POST_OTHER_ACNT
            ,POST_BAL_BY
            ,POST_DFLT_PERD
            ,POST_RPT_ERR_ONLY
            ,POST_SUPPRESS_SUB_MSG
            ,POST_RPT_FMT
            ,JRNL_TYPE
            ,POST_RPT_ACNT
            ,CNT_ORIG
            ,CNT_REJECTED
            ,CNT_BAL
            ,CNT_REVERSALS
            ,CNT_POSTED
            ,CNT_SUBSTITUTED
            ,CNT_PRINTED
            ,POST_LDG
            ,POST_ALLOW_OVER_BDGT
            ,POST_ALLOW_SUSPNS_ACNT
            ,CNT_ZERO_VAL_ENTRIES
            ,JNL_NUM
            ,NUM_OF_IMBALANCES
            ,DR_AMT_POSTED
            ,CR_AMT_POSTED
            ,POST_TXN_REF_BAL
         ) 
         values(0,
                           'IFC',
                           GETDATE() ,
                           'IFC', 
                           CAST('12/2/2021' as date),
                           'LI',
                           '${LedgerImportDescription}',
                           0,
                           2,
                           1,
                           0,
                           0,
                           '${SuspenseAccount}',
                           '${SuspenseAccount}',
                           '',
                           0,
                           1,
                           1,
                           'LIALL', 
                            '${JournalType}',
                           '${SuspenseAccount}',
                           0,
                           0,
                           0,
                           0,
                           0,
                           0,
                           0,
                           'A',
                           0,
                           0,
                           0,
                           0,
                           0,
                           0.000,
                           0.000,
                           0 )
                           END ` );

        let HDR_ID = await request.query(`select PSTG_HDR_ID from ${pk1}_PSTG_HDR WHERE  PSTG_HDR_ID=(SELECT max(PSTG_HDR_ID) FROM ${pk1}_PSTG_HDR where  DESCR='${LedgerImportDescription}')`)
        HDR_ID = HDR_ID.recordset[0].PSTG_HDR_ID;
        console.log(HDR_ID, "kkkkk");
        for (let i = 0; i < data.length; i++) {
            let ind = ''
            if (data[i] == '') {
                data[i] = null
            }
            if (data[i].Total < 0) {
                ind = 'D'
            }
            if (data[i].Total >= 0) {
                ind = 'C'
            }
            let TransactionDate = data[i].TransactionDate
            TransactionDate = TransactionDate.toISOString().replace('T', ' ').replace('Z', ' ')


            // let x=await request.query(`EXEC sp_describe_first_result_set N'SELECT * FROM ${pk1}_PSTG_DETAIL'`);
            // for (let i = 0; i < x.recordset.length; i++) {
            //     console.log(x.recordset.system_type_name);
            // }
            // let tempstr2 = ""
            // for (let k = 2; k < x.recordset.length; k++) {
            //     if (x.recordset[k]['system_type_name'].includes('date')) {
            //     tempstr2 += " GETDATE(),";
            //     } else if (x.recordset[k]['system_type_name'].includes('char')) {
            //     tempstr2 += "  '"+ data.recordsets[i]+"',";
            //     }
            //     else {
            //     tempstr2 += " "+ data.recordsets[i]+",";
            //     }
            //   }
            // console.log(tempstr2);
            await request.query(` 
        IF NOT EXISTS (SELECT * FROM ${pk1}_PSTG_DETAIL
          WHERE  PSTG_HDR_ID=${HDR_ID} and LINE_NUM=${i + 1})    
          BEGIN
        insert into  ${pk1}_PSTG_DETAIL (
            PSTG_HDR_ID
            ,LINE_NUM
            ,UPDATE_COUNT
            ,LAST_CHANGE_USER_ID
            ,LAST_CHANGE_DATETIME
            ,ACNT_CODE
            ,PERD
            ,TXN_DATETIME
            ,JNL_NUM
            ,JNL_LINE_NUM
            ,JNL_TYPE
            ,JNL_SRCE
            ,TXN_REF
            ,DESCR
            ,AMT
            ,DR_CR_IND
            ,CONV_CODE
            ,CONV_RATE
            ,TXN_AMT
            ,TXN_DEC_PL
            ,BASE_RATE
            ,BASE_OPR
            ,CONV_OPR
            ,RPT_RATE
            ,RPT_OPR
            ,RPT_AMT
            ,MEMO_AMT
            ,ALLOCN_IND
            ,ALLOCN_REF
            ,ALLOCN_DATETIME
            ,ALLOCN_PERD
            ,ALLOCN_IN_PROGRESS
            ,ENTRY_DATETIME 
            ,ENTRY_PERD
            ,DUE_DATETIME
            ,PSTG_DATETIME
            ,ASSET_IND
            ,ASSET_CODE
            ,ASSET_SUB_CODE
            ,CLEARDOWN
            ,REVERSAL
            ,LOSS_GAIN
            ,ROUGH_FLAG
            ,IN_USE_FLAG
            ,EXCL_BAL
            ,ANL_CODE_T0
            ,ANL_CODE_T1
            ,ANL_CODE_T2
            ,ANL_CODE_T3
            ,ANL_CODE_T4
            ,ANL_CODE_T5
            ,ANL_CODE_T6
            ,ANL_CODE_T7
            ,ANL_CODE_T8
            ,ANL_CODE_T9
            ,HOLD_REF
            ,HOLD_OPR_CODE
            ,DOC_1_DATETIME
            ,DOC_2_DATETIME
            ,DOC_3_DATETIME
            ,DOC_4_DATETIME
            ,DOC_NUM_PRFX_1
            ,DOC_NUM_1
            ,DOC_NUM_PRFX_2
            ,DOC_NUM_2
            ,DOC_NUM_PRFX_3
            ,DOC_NUM_3
            ,DOC_NUM_PRFX_4
            ,DOC_NUM_4
            ,DISC_1_DATETIME
            ,DISC_PCENT_1
            ,DISC_2_DATETIME
            ,DISC_PCENT_2
            ,INTEREST_DATETIME
            ,INTEREST_PCENT
            ,LATE_PYMT_DATETIME
            ,LATE_PYMT_PCENT
            ,PYMT_REF
            ,BANK_CODE
            ,SRCE_REF
            ,MODULE_CODE
            ,PYMT_TERMS_GRP_CODE
            ,STD_TEXT_CLASS_CODE
            ,STD_TEXT_CODE
            ,CONSUMED_BDGT_ID
            ,CV4_CONV_CODE
            ,CV4_AMT
            ,CV4_CONV_RATE
            ,CV4_OPERATOR
            ,CV4_DP
            ,CV5_CONV_CODE
            ,CV5_AMT
            ,CV5_CONV_RATE
            ,CV5_OPERATOR
            ,CV5_DP
            ,LINK_REF_1
            ,LINK_REF_2
            ,LINK_REF_3
            ,PRINCIPAL_CODE_1
            ,PRINCIPAL_CODE_2
            ,PRINCIPAL_CODE_3
            ,PRINCIPAL_CODE_4
            ,PRINCIPAL_CODE_5
            ,PRINCIPAL_CODE_6
            ,PRINCIPAL_CODE_7
            ,PRINCIPAL_CODE_8
            ,PRINCIPAL_CODE_9
            ,PRINCIPAL_CODE_10
            ,PRINCIPAL_CODE_11
            ,PRINCIPAL_CODE_12
            ,PRINCIPAL_CODE_13
            ,PRINCIPAL_CODE_14
            ,PRINCIPAL_CODE_15
            ,PRINCIPAL_CODE_16
            ,PRINCIPAL_CODE_17
            ,PRINCIPAL_CODE_18
            ,PRINCIPAL_CODE_19
            ,PRINCIPAL_CODE_20
            ,ALLOCN_CODE
            ,ALLOCN_STMNTS
            ,ALLOCN_USER_ID
            ,SPLIT_ORIG_LINE
            ,VAL_DATETIME
            ,SIGNING_DETAILS
            ,INSTLMT_DATETIME
            ,BINDER_STATUS
            ,AGREED_STATUS
            ,SPLIT_LINK_REF
            ,PSTG_REF
            ,TRUE_RATED
            ,HOLD_DATETIME
            ,HOLD_TEXT
            ,INSTLMT_NUM
            ,SUPPLMNTRY_EXTSN
            ,APRVLS_EXTSN
            ,REVAL_LINK_REF
            ,MAN_PAY_OVER
            ,PYMT_STAMP
            ,AUTHORISTN_IN_PROGRESS
            ,SPLIT_IN_PROGRESS
            ,VCHR_NUM
            ,ORIGINATOR_ID
            ,ORIGINATED_DATETIME
            ,JNL_CLASS_CODE
            ,ALLOC_ID
            ,JNL_REVERSAL_TYPE
         ) 
         values(${HDR_ID},
            ${i + 1},
            0 ,
            '',
            GETDATE() ,
            '${data[i].Account}' ,
            ${data[i].Period},
            '${TransactionDate}',
            0 ,
            ${i + 1} ,
            '${JournalType}' ,
            '' , 
            '${data[i].Reference}' ,
            '' ,
            ${data[i].Total} , 
            '${ind}' ,
             '${Currencycode}' ,
             0 ,
             ${data[i].Total} , 
             '' ,
             0 ,
              '' ,
               '' ,
               0 ,
                '' ,
                0 ,
                0 ,
                0 ,
                0,
                 GETDATE() ,
                 0 ,
            0, 
                GETDATE() ,
                0,
                 GETDATE(),
                  GETDATE() ,
                  0 ,
                   '' ,
                    '' , 
                    '' ,
                    0 ,
                    0 ,
                    0 ,
                    0 ,
                    0 ,
                     '${data[i].T01}' , '${data[i].T02}' , '${data[i].T03}' , '${data[i].T04}' , '${data[i].T05}' , '${data[i].T06}' , '${data[i].T07}' , '${data[i].T08}' , '${data[i].T09}' , '${data[i].T10}' ,0 , '', GETDATE(), GETDATE(), GETDATE(), GETDATE() , '' ,0 , '' ,0 , '' ,0 , '' ,0, GETDATE() ,0, GETDATE() ,0, GETDATE() ,0, GETDATE() ,0 , '' , '' , '' , '' , '' , '' , '' ,0 , '' ,0 ,0 , '' , '' , '' ,0 ,0 , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' ,0 , '' ,0, GETDATE() , '', GETDATE() , '' ,0 , '' , '' ,0, GETDATE() , '' ,0 ,0 ,0 ,0 ,0 , '' ,0 ,0 , '' , '', GETDATE() , '' , '' ,0)END`)
        }

        //await request.query(``)
        if (res != undefined) {

            res.json("successfully")
        }
    } catch (error) {
        if (res != undefined) {

            res.json(error.message)
        }
    }


}
module.exports.importSun = async (req, res) => {
    // let dates=getDaysArray("2022-02-20","2022-02-23")
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            console.log(req.body);
            let sqlPoolAPI = await mssql.GetCreateIfNotExistPool(config)
            let requestAPI = new sql.Request(sqlPool)
            const sunCon = await requestAPI.query(`SELECT SunUser,SunPassword,Sunserver,SunDatabase,SunSchedule From  interfaceDefinition where interfaceCode=${req.body.interfaceCod} `);
            const buD = await requestAPI.query(`SELECT BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,MappingCode from PropertySettings where interfaceCode=${req.body.interfaceCod}`)
            let MappingCode = buD.recordset[0].MappingCode
            let pk1 = buD.recordset[0].BU
            let SuspenseAccount = buD.recordset[0].SuspenseAccount
            let JournalType = buD.recordset[0].JournalType
            let Currencycode = buD.recordset[0].Currencycode
            let LedgerImportDescription = buD.recordset[0].LedgerImportDescription
            let data = await requestAPI.query(`select Main.Account , Main.Reference , Main.Total , Main.rvcNum ,Main.TransactionDate, Main.Period , isnull(T01.Target,'#') 'T01' , isnull(T02.Target,'#') 'T02' 
        ,isnull(T03.Target,'#') 'T03'
        ,isnull(T04.Target,'#') 'T04'
        ,isnull(T05.Target,'#') 'T05'
        ,isnull(T06.Target,'#') 'T06'
        ,isnull(T07.Target,'#') 'T07'
        ,isnull(T08.Target,'#') 'T08'
        ,isnull(T09.Target,'#') 'T09'
        ,isnull(T10.Target,'#') 'T10'

        from 
        (select Main.Reference , Acc.Target 'Account', sum(Main.Total) 'Total', Main.rvcNum , Main.busDt 'TransactionDate' , ltrim(Year(Main.busDt))+RIGHT('000'+ ltrim(MONTH(Main.busDt)),3) 'Period' from VIEW_JV_MAIN Main
        left join Mapping Acc on Main.Reference = Acc.Source and Acc.MappingType = 'Account' and Acc.MappingCode = '${MappingCode}'

        where Main.busDt = '${req.body.date}'
        group by Main.Reference,Main.rvcNum , Main.busDt , Acc.Target
        ) as Main

        left join Mapping as T01 on Main.Reference = T01.Source and Main.rvcNum = T01.RevenuCenter and T01.ALevel = 1 and T01.MappingCode = '${MappingCode}'
        left join Mapping as T02 on Main.Reference = T02.Source and Main.rvcNum = T02.RevenuCenter and T02.ALevel =  2  and T02.MappingCode = '${MappingCode}'
        left join Mapping as T03 on Main.Reference = T03.Source and Main.rvcNum = T03.RevenuCenter and T03.ALevel =  3  and T03.MappingCode = '${MappingCode}'
        left join Mapping as T04 on Main.Reference = T04.Source and Main.rvcNum = T04.RevenuCenter and T04.ALevel =  4  and T04.MappingCode = '${MappingCode}'
        left join Mapping as T05 on Main.Reference = T05.Source and Main.rvcNum = T05.RevenuCenter and T05.ALevel =  5  and T05.MappingCode = '${MappingCode}'
        left join Mapping as T06 on Main.Reference = T06.Source and Main.rvcNum = T06.RevenuCenter and T06.ALevel =  6  and T06.MappingCode = '${MappingCode}'
        left join Mapping as T07 on Main.Reference = T07.Source and Main.rvcNum = T07.RevenuCenter and T07.ALevel =  7  and T07.MappingCode = '${MappingCode}'
        left join Mapping as T08 on Main.Reference = T08.Source and Main.rvcNum = T08.RevenuCenter and T08.ALevel =  8  and T08.MappingCode = '${MappingCode}'
        left join Mapping as T09 on Main.Reference = T09.Source and Main.rvcNum = T09.RevenuCenter and T09.ALevel =  9  and T09.MappingCode = '${MappingCode}'
        left join Mapping as T10 on Main.Reference = T10.Source and Main.rvcNum = T10.RevenuCenter and T10.ALevel =  10  and T10.MappingCode = '${MappingCode}'`)
            data = data.recordset
            console.log(data, LedgerImportDescription, MappingCode);
            const dbConfig = {
                user: sunCon.recordset[0].SunUser,
                password: sunCon.recordset[0].SunPassword,
                server: sunCon.recordset[0].Sunserver,
                database: sunCon.recordset[0].SunDatabase,
                "options": {
                    "abortTransactionOnError": true,
                    "encrypt": false,
                    "enableArithAbort": true,
                    trustServerCertificate: true
                },
                charset: 'utf8'
            };
            let sqlPool = await mssql.GetCreateIfNotExistPool(dbConfig)
            let request = new sql.Request(sqlPool)
            // let HDR_I = await sql.query(`SELECT max(PSTG_HDR_ID) FROM ${pk1}_PSTG_HDR where  DESCR='HRMS'`)
            // console.log(HDR_I);
            //                    HDR_I = HDR_I.recordsets[0].PSTG_HDR_ID;
            await request.query(`
            
            IF NOT EXISTS (SELECT * FROM ${pk1}_PSTG_HDR
                WHERE  LAST_CHANGE_DATETIME = GETDATE() )
                BEGIN
            insert into  ${pk1}_PSTG_HDR (UPDATE_COUNT,
                LAST_CHANGE_USER_ID,
                LAST_CHANGE_DATETIME
                ,CREATED_BY,
                CREATED_DATETIME,
                CREATION_TYPE,
                DESCR ,
                LAST_STATUS ,
                POST_TYPE
                ,POST_WRITE_TO_HOLD,
                POST_ROUGH_BOOK ,
                POST_ALLOW_BAL_TRANS,
                POST_SUSPENSE_ACNT,
                POST_OTHER_ACNT
                ,POST_BAL_BY
                ,POST_DFLT_PERD
                ,POST_RPT_ERR_ONLY
                ,POST_SUPPRESS_SUB_MSG
                ,POST_RPT_FMT
                ,JRNL_TYPE
                ,POST_RPT_ACNT
                ,CNT_ORIG
                ,CNT_REJECTED
                ,CNT_BAL
                ,CNT_REVERSALS
                ,CNT_POSTED
                ,CNT_SUBSTITUTED
                ,CNT_PRINTED
                ,POST_LDG
                ,POST_ALLOW_OVER_BDGT
                ,POST_ALLOW_SUSPNS_ACNT
                ,CNT_ZERO_VAL_ENTRIES
                ,JNL_NUM
                ,NUM_OF_IMBALANCES
                ,DR_AMT_POSTED
                ,CR_AMT_POSTED
                ,POST_TXN_REF_BAL
            ) 
            values(0,
                            'IFC',
                            GETDATE() ,
                            'IFC', 
                            CAST('12/2/2021' as date),
                            'LI',
                            '${LedgerImportDescription}',
                            0,
                            2,
                            1,
                            0,
                            0,
                            '${SuspenseAccount}',
                            '${SuspenseAccount}',
                            '',
                            0,
                            1,
                            1,
                            'LIALL', 
                                '${JournalType}',
                            '${SuspenseAccount}',
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            'A',
                            0,
                            0,
                            0,
                            0,
                            0,
                            0.000,
                            0.000,
                            0 )
                            END ` );

            let HDR_ID = await request.query(`select PSTG_HDR_ID from ${pk1}_PSTG_HDR WHERE  PSTG_HDR_ID=(SELECT max(PSTG_HDR_ID) FROM ${pk1}_PSTG_HDR where  DESCR='${LedgerImportDescription}')`)
            HDR_ID = HDR_ID.recordset[0].PSTG_HDR_ID;
            console.log(HDR_ID, "kkkkk");
            for (let i = 0; i < data.length; i++) {
                let ind = ''
                if (data[i] == '') {
                    data[i] = null
                }
                if (data[i].Total < 0) {
                    ind = 'D'
                }
                if (data[i].Total >= 0) {
                    ind = 'C'
                }
                let TransactionDate = data[i].TransactionDate
                TransactionDate = TransactionDate.toISOString().replace('T', ' ').replace('Z', ' ')


                // let x=await sql.query(`EXEC sp_describe_first_result_set N'SELECT * FROM ${pk1}_PSTG_DETAIL'`);
                // for (let i = 0; i < x.recordset.length; i++) {
                //     console.log(x.recordset.system_type_name);
                // }
                // let tempstr2 = ""
                // for (let k = 2; k < x.recordset.length; k++) {
                //     if (x.recordset[k]['system_type_name'].includes('date')) {
                //     tempstr2 += " GETDATE(),";
                //     } else if (x.recordset[k]['system_type_name'].includes('char')) {
                //     tempstr2 += "  '"+ data.recordsets[i]+"',";
                //     }
                //     else {
                //     tempstr2 += " "+ data.recordsets[i]+",";
                //     }
                //   }
                // console.log(tempstr2);
                await request.query(` 
            IF NOT EXISTS (SELECT * FROM ${pk1}_PSTG_DETAIL
            WHERE  PSTG_HDR_ID=${HDR_ID} and LINE_NUM=${i + 1})    
            BEGIN
            insert into  ${pk1}_PSTG_DETAIL (
                PSTG_HDR_ID
                ,LINE_NUM
                ,UPDATE_COUNT
                ,LAST_CHANGE_USER_ID
                ,LAST_CHANGE_DATETIME
                ,ACNT_CODE
                ,PERD
                ,TXN_DATETIME
                ,JNL_NUM
                ,JNL_LINE_NUM
                ,JNL_TYPE
                ,JNL_SRCE
                ,TXN_REF
                ,DESCR
                ,AMT
                ,DR_CR_IND
                ,CONV_CODE
                ,CONV_RATE
                ,TXN_AMT
                ,TXN_DEC_PL
                ,BASE_RATE
                ,BASE_OPR
                ,CONV_OPR
                ,RPT_RATE
                ,RPT_OPR
                ,RPT_AMT
                ,MEMO_AMT
                ,ALLOCN_IND
                ,ALLOCN_REF
                ,ALLOCN_DATETIME
                ,ALLOCN_PERD
                ,ALLOCN_IN_PROGRESS
                ,ENTRY_DATETIME 
                ,ENTRY_PERD
                ,DUE_DATETIME
                ,PSTG_DATETIME
                ,ASSET_IND
                ,ASSET_CODE
                ,ASSET_SUB_CODE
                ,CLEARDOWN
                ,REVERSAL
                ,LOSS_GAIN
                ,ROUGH_FLAG
                ,IN_USE_FLAG
                ,EXCL_BAL
                ,ANL_CODE_T0
                ,ANL_CODE_T1
                ,ANL_CODE_T2
                ,ANL_CODE_T3
                ,ANL_CODE_T4
                ,ANL_CODE_T5
                ,ANL_CODE_T6
                ,ANL_CODE_T7
                ,ANL_CODE_T8
                ,ANL_CODE_T9
                ,HOLD_REF
                ,HOLD_OPR_CODE
                ,DOC_1_DATETIME
                ,DOC_2_DATETIME
                ,DOC_3_DATETIME
                ,DOC_4_DATETIME
                ,DOC_NUM_PRFX_1
                ,DOC_NUM_1
                ,DOC_NUM_PRFX_2
                ,DOC_NUM_2
                ,DOC_NUM_PRFX_3
                ,DOC_NUM_3
                ,DOC_NUM_PRFX_4
                ,DOC_NUM_4
                ,DISC_1_DATETIME
                ,DISC_PCENT_1
                ,DISC_2_DATETIME
                ,DISC_PCENT_2
                ,INTEREST_DATETIME
                ,INTEREST_PCENT
                ,LATE_PYMT_DATETIME
                ,LATE_PYMT_PCENT
                ,PYMT_REF
                ,BANK_CODE
                ,SRCE_REF
                ,MODULE_CODE
                ,PYMT_TERMS_GRP_CODE
                ,STD_TEXT_CLASS_CODE
                ,STD_TEXT_CODE
                ,CONSUMED_BDGT_ID
                ,CV4_CONV_CODE
                ,CV4_AMT
                ,CV4_CONV_RATE
                ,CV4_OPERATOR
                ,CV4_DP
                ,CV5_CONV_CODE
                ,CV5_AMT
                ,CV5_CONV_RATE
                ,CV5_OPERATOR
                ,CV5_DP
                ,LINK_REF_1
                ,LINK_REF_2
                ,LINK_REF_3
                ,PRINCIPAL_CODE_1
                ,PRINCIPAL_CODE_2
                ,PRINCIPAL_CODE_3
                ,PRINCIPAL_CODE_4
                ,PRINCIPAL_CODE_5
                ,PRINCIPAL_CODE_6
                ,PRINCIPAL_CODE_7
                ,PRINCIPAL_CODE_8
                ,PRINCIPAL_CODE_9
                ,PRINCIPAL_CODE_10
                ,PRINCIPAL_CODE_11
                ,PRINCIPAL_CODE_12
                ,PRINCIPAL_CODE_13
                ,PRINCIPAL_CODE_14
                ,PRINCIPAL_CODE_15
                ,PRINCIPAL_CODE_16
                ,PRINCIPAL_CODE_17
                ,PRINCIPAL_CODE_18
                ,PRINCIPAL_CODE_19
                ,PRINCIPAL_CODE_20
                ,ALLOCN_CODE
                ,ALLOCN_STMNTS
                ,ALLOCN_USER_ID
                ,SPLIT_ORIG_LINE
                ,VAL_DATETIME
                ,SIGNING_DETAILS
                ,INSTLMT_DATETIME
                ,BINDER_STATUS
                ,AGREED_STATUS
                ,SPLIT_LINK_REF
                ,PSTG_REF
                ,TRUE_RATED
                ,HOLD_DATETIME
                ,HOLD_TEXT
                ,INSTLMT_NUM
                ,SUPPLMNTRY_EXTSN
                ,APRVLS_EXTSN
                ,REVAL_LINK_REF
                ,MAN_PAY_OVER
                ,PYMT_STAMP
                ,AUTHORISTN_IN_PROGRESS
                ,SPLIT_IN_PROGRESS
                ,VCHR_NUM
                ,ORIGINATOR_ID
                ,ORIGINATED_DATETIME
                ,JNL_CLASS_CODE
                ,ALLOC_ID
                ,JNL_REVERSAL_TYPE
            ) 
            values(${HDR_ID},
                ${i + 1},
                0 ,
                '',
                GETDATE() ,
                '${data[i].Account}' ,
                ${data[i].Period},
                '${TransactionDate}',
                0 ,
                ${i + 1} ,
                '${JournalType}' ,
                '' , 
                '${data[i].Reference}' ,
                '' ,
                ${data[i].Total} , 
                '${ind}' ,
                '${Currencycode}' ,
                0 ,
                ${data[i].Total} , 
                '' ,
                0 ,
                '' ,
                '' ,
                0 ,
                    '' ,
                    0 ,
                    0 ,
                    0 ,
                    0,
                    GETDATE() ,
                    0 ,
                0, 
                    GETDATE() ,
                    0,
                    GETDATE(),
                    GETDATE() ,
                    0 ,
                    '' ,
                        '' , 
                        '' ,
                        0 ,
                        0 ,
                        0 ,
                        0 ,
                        0 ,
                        '${data[i].T01}' , '${data[i].T02}' , '${data[i].T03}' , '${data[i].T04}' , '${data[i].T05}' , '${data[i].T06}' , '${data[i].T07}' , '${data[i].T08}' , '${data[i].T09}' , '${data[i].T10}' ,0 , '', GETDATE(), GETDATE(), GETDATE(), GETDATE() , '' ,0 , '' ,0 , '' ,0 , '' ,0, GETDATE() ,0, GETDATE() ,0, GETDATE() ,0, GETDATE() ,0 , '' , '' , '' , '' , '' , '' , '' ,0 , '' ,0 ,0 , '' , '' , '' ,0 ,0 , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' ,0 , '' ,0, GETDATE() , '', GETDATE() , '' ,0 , '' , '' ,0, GETDATE() , '' ,0 ,0 ,0 ,0 ,0 , '' ,0 ,0 , '' , '', GETDATE() , '' , '' ,0)END`)
            }


            //await sql.query(``) 
            res.json("successfully")
        } catch (error) {
            res.json(error.message)
        }
    else
        res.json(errors)
}

module.exports.PropertySettings = async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        try {
            let sqlPool = await mssql.GetCreateIfNotExistPool(config)
            let request = new sql.Request(sqlPool)
            //used to establish connection between database and the middleware
            //query to insert Property data(BU,JournalType,Revenue,level,Currencycode) into PropertySettings table in database 
            // const values = await request.query(`insert into PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,ConnectionCode) VALUES  ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.ConnectionCode}')`);
            console.log(
                `IF NOT EXISTS (SELECT * FROM PropertySettings
                    WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
                    BEGIN
                    INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
                    VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
                    END`);
            const values = await request.query(
                `IF NOT EXISTS (SELECT * FROM PropertySettings
                    WHERE BU='${req.body.BU}' and JournalType='${req.body.JournalType}' and Currencycode='${req.body.Currencycode}' and LedgerImportDescription='${req.body.LedgerImportDescription}' and SuspenseAccount='${req.body.SuspenseAccount}' and interfaceCode='${req.body.interfaceCode}' and MappingCode='${req.body.MappingCode}')
                    BEGIN
                    INSERT INTO PropertySettings (BU,JournalType,Currencycode,LedgerImportDescription,SuspenseAccount,interfaceCode,MappingCode)
                    VALUES ('${req.body.BU}','${req.body.JournalType}','${req.body.Currencycode}','${req.body.LedgerImportDescription}','${req.body.SuspenseAccount}','${req.body.interfaceCode}','${req.body.MappingCode}')
                    END`)

            const sunCon = await request.query(`SELECT SunUser,SunPassword,Sunserver,SunDatabase,SunSchedule From  interfaceDefinition where interfaceCode='${req.body.interfaceCode}' `);
            await request.close()
            // console.log(sunCon,sunCon.recordset[0].SunSchedule);
            let sunConuser = sunCon.recordset[0].SunUser;
            let sunConSunPassword = sunCon.recordset[0].SunPassword
            let sunConSunserver = sunCon.recordset[0].Sunserver
            let sunConSunDatabase = sunCon.recordset[0].SunDatabase
            const dbConfig = {
                user: sunConuser,
                password: sunConSunPassword,
                server: sunConSunserver,
                database: sunConSunDatabase,
                "options": {
                    "abortTransactionOnError": true,
                    "encrypt": false,
                    "enableArithAbort": true,
                    trustServerCertificate: true
                },
                charset: 'utf8'
            };
            jobSun.reschedule(sunCon.recordset[0].SunSchedule)
            //await request.query(``)
            await request.close()
            //used to close the connection between database and the middleware
            res.json(req.body)//viewing the data which is array of obecjts which is json
        } catch (error) {
            res.json(error.message)
        }
    else{
        res.json(errors)
    }
}