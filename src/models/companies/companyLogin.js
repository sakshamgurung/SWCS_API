const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email:{
        type:String
    },
    mobile_no:{
        type:String,
        alias:"mobileNo"
    },
    password:{
        type:String,
        required:true
    },
    uuid:[String],
    token:{
        type:String,
        required:true
    },
    refresh_token:{
        type:String,
        required:true,
        alias:"refreshToken"
    },
    time_stamp:{
        type:Schema.Types.Date,
        required:true,
        alias:"timeStamp"
    },
    is_company_accepted:{
        type:Boolean,
        alias:"isCompanyAccepted"
    }
},{
    collection:"company_login"
});

class HelperClass{
    static findAllCompany(session){
        return this.find({},{ session:session });
    }
    static findCompanyById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCompanyById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCompanyById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    //new
    static findCompanyByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray }},{ session:session });
    }
    //new
    static findCompanyByToken(token, session){
        return this.find({ token:token },{ session:session });
    }
    //new 
    static findCompanyByRefreshToken(refreshToken, session){
        return this.find({ refresh_token: refreshToken },{ session:session });
    }
    //new
    static findCompanyByTimeStamp(timeStamp, session){
        return this.find({ time_stamp:timeStamp },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyLogin = mongoose.model('CompanyLogin', schema);