const dotenv = require('dotenv');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if(process.env.NODE_ENV === "development"){
  const envFound = dotenv.config();
  if(envFound.error){
    throw new Error("Couldn't find .env file");
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10),
  databaseURL: process.env.MONGODB_URI,
  remoteDatabaseURL: process.env.MONGODB_ATLAS_URI
};