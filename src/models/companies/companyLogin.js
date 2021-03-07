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
    },
    isCompanyAccepted:{
        type:Boolean,
    }
},{
    collection:"companyLogins"
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

    static findCompanyByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray }},{ session:session });
    }

    static findCompanyByToken(token, session){
        return this.find({ token:token },{ session:session });
    }
     
    static findCompanyByRefreshToken(refreshToken, session){
        return this.find({ refreshToken: refreshToken },{ session:session });
    }
     
    static findCompanyByResetToken(resetToken, session){
        return this.find({ resetToken: resetToken },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyLogin = mongoose.model('CompanyLogin', schema);