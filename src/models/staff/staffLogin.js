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
    static findAllStaff(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
        }
    }

    static findStaffById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateStaffById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteStaffById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findStaffByEmail(email, projection, session){
        if(session == undefined){
            return this.find({ email}, projection);
        }else{
            return this.find({ email}, projection, { session });
        }
    }

    static findStaffByMobileNo(mobileNo, projection, session){
        if(session == undefined){
            return this.find({ mobileNo}, projection);
        }else{
            return this.find({ mobileNo}, projection, { session });
        }
    }
    
    static findStaffByUUID(uuidArray, projection, session){
        if(session == undefined){
            return this.find({ uuid:{ $in: uuidArray } }, projection);
        }else{
            return this.find({ uuid:{ $in: uuidArray } }, projection, { session });
        }
    }
    
    static findStaffByToken(token, projection, session){
        if(session == undefined){
            return this.find({ token }, projection);
        }else{
            return this.find({ token }, projection, { session });
        }
    }
     
    static findStaffByRefreshToken(refreshToken, projection, session){
        if(session == undefined){
            return this.find({ refreshToken }, projection);
        }else{
            return this.find({ refreshToken }, projection, { session });
        }
    }
     
    static findStaffByResetToken(resetToken, projection, session){
        if(session == undefined){
            return this.find({ resetToken }, projection);
        }else{
            return this.find({ resetToken }, projection, { session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = StaffLogin = mongoose.model('StaffLogin', schema);