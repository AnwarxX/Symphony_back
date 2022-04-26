//here we eneter the configration for the connection with database by writing the username , password , database name and the
//server that can access the database 
const fs = require('fs')
let databaseConn=JSON.parse(fs.readFileSync('configuration/capsConfig.txt', 'utf8'))
const dbCapsConfig = {
  user: databaseConn.user,
  password: databaseConn.password,
  server: databaseConn.server,
  database: databaseConn.database,
  "options": {
    "abortTransactionOnError": true,
    "encrypt": false,
    "enableArithAbort": true,
    trustServerCertificate: true
  },
  charset: 'utf8'
};
module.exports = dbCapsConfig