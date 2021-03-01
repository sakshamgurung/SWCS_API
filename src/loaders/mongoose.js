const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async ()=> {
  try{
    console.log(config.databaseURL)
    await mongoose.connect(config.databaseURL,{
      useNewUrlParser:true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("Data base connected");
  }catch(err){
    console.error(err.message);
    //process exit
    process.exit(1);
  }
};

module.exports = connectDB;
