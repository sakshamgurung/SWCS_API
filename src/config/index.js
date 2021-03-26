const dotenv = require('dotenv');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if(process.env.NODE_ENV === "development"){
  const envFound = dotenv.config();
  if(envFound.error){
    throw new Error("Couldn't find .env file");
  }
}
/**
 * if heroku error: Cannot read property 'split' of null
 * check env config variables and make sure database uri does not contain quotes in uri 
 * or 
 * you can set username and password as env config variables and use them with template literals in mongoose connect 
 * */


module.exports = {
  port: parseInt(process.env.PORT, 10),
  databaseURL: process.env.MONGODB_URI,
  remoteDatabaseURL: process.env.MONGODB_ATLAS_URI
};