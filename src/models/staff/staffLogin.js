const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
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
    }
},{
    collection:"staff_login"
});

class HelperClass{
    static findAllStaff(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
    }
    static findStaffById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateStaffById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteStaffById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findStaffByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray } },{ session:session });
    }
    //new
    static findStaffByToken(token, session){
        return this.find({ token:token },{ session:session });
    }
    //new 
    static findStaffByRefreshToken(refreshToken, session){
        return this.find({ refresh_token: refreshToken },{ session:session });
    }
    //new
    static findStaffByTimeStamp(timeStamp, session){
        return this.find({ time_stamp:timeStamp },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = StaffLogin = mongoose.model('StaffLogin', schema);