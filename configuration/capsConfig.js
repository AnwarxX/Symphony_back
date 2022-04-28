//here we eneter the configration for the connection with database by writing the username , password , database name and the
//server that can access the database
let mssql = require('../configuration/mssql-pool-management.js')
const sql = require('mssql')//call for using sql module
const config = require('../configuration/config')
async function getCapses(dbCapsConfig) {
  let sqlPool = await mssql.GetCreateIfNotExistPool(config)
  let request = new sql.Request(sqlPool)
  let databaseConn=await request.query(`SELECT * FROM capsConfig`);
  for (let i = 0; i < databaseConn.recordset.length; i++) {
    dbCapsConfig.push({
      user: databaseConn.recordset[i].user,
      password: databaseConn.recordset[i].password,
      server: databaseConn.recordset[i].server,
      database: databaseConn.recordset[i].database,
      "options": {
        "abortTransactionOnError": true,
        "encrypt": false,
        "enableArithAbort": true,
        trustServerCertificate: true
      },
      charset: 'utf8'
    })
  }
  console.log(dbCapsConfig);
}
dbCapsConfig=[]
getCapses(dbCapsConfig)
console.log("yfudyudytxytx");
module.exports = {
  foo:async function(x){
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let databaseConn=await request.query(`SELECT * FROM capsConfig`);
    let dbCapsConfig=[]
    for (let i = 0; i < databaseConn.recordset.length; i++) {
      dbCapsConfig.push({
        user: databaseConn.recordset[i].user,
        password: databaseConn.recordset[i].password,
        server: databaseConn.recordset[i].server,
        database: databaseConn.recordset[i].database,
        "options": {
          "abortTransactionOnError": true,
          "encrypt": false,
          "enableArithAbort": true,
          trustServerCertificate: true
        },
        charset: 'utf8'
      })
    }
    return dbCapsConfig;
  }
}