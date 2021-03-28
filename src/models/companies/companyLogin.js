const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email:{
        type:String
    },
    mobileNo:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    firstTimeLogin:{
        type:Boolean,
    },
    uuid:[String],
    resetToken:{
        type:String,
    },
    resetTokenTimeStamp:{
        type:String,
    },
    token:{
        type:String,
        //required:true
    },
    refreshToken:{
        type:String,
        //required:true,
    },
    timeStamp:{
        type:Schema.Types.Date,
        //required:true,
    },
    isCompanyAccepted:{
        type:Boolean,
    }
},{
    collection:"companyLogins"
});

class HelperClass{

    static findByUUID(uuidArray, query, projection, session){
        if(session == undefined){
            return this.find({ $and:[{ uuid:{ $in: uuidArray }}, query]}, projection);
        }else{
            return this.find({ $and:[{uuid:{ $in: uuidArray }}, query]}, projection, { session });  
        }
    }

}

schema.loadClass(HelperClass);

module.exports = CompanyLogin = mongoose.model('CompanyLogin', schema);