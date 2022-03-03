//here we eneter the configration for the connection with database by writing the username , password , database name and the
//server that can access the database 

const dbConfig = {
  user: "DEV",
  password: "P@ssw0rd",
  server: "192.168.1.78",
  database: "SimphonyApi",
  "options": {
    "abortTransactionOnError": true,
    "encrypt": false,
    "enableArithAbort": true,
    trustServerCertificate: true
  },
  charset: 'utf8'
};
module.exports = dbConfig
