const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
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
    uuid:[String],
    resetToken:{
        type:String,
    },
    resetTokenTimeStamp:{
        type:String,
    },
    token:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String,
        required:true,
    },
    timeStamp:{
        type:Schema.Types.Date,
        required:true,
    }
},{
    collection:"staffLogins"
});

class HelperClass{
    static findAllStaff(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
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

    static findStaffByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray } },{ session:session });
    }
    
    static findStaffByToken(token, session){
        return this.find({ token:token },{ session:session });
    }
     
    static findStaffByRefreshToken(refreshToken, session){
        return this.find({ refreshToken: refreshToken },{ session:session });
    }
     
    static findCompanyByResetToken(resetToken, session){
        return this.find({ resetToken: resetToken },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = StaffLogin = mongoose.model('StaffLogin', schema);