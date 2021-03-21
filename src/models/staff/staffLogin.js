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
    firstTimeLogin:{
        type:Boolean,
    },
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
    }
},{
    collection:"staffLogins"
});

class HelperClass{
    static findAll(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
        }
    }

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findByEmail(email, projection, session){
        if(session == undefined){
            return this.find({ email}, projection);
        }else{
            return this.find({ email}, projection, { session });
        }
    }

    static findByMobileNo(mobileNo, projection, session){
        if(session == undefined){
            return this.find({ mobileNo}, projection);
        }else{
            return this.find({ mobileNo}, projection, { session });
        }
    }
    
    static findByUUID(uuidArray, projection, session){
        if(session == undefined){
            return this.find({ uuid:{ $in: uuidArray } }, projection);
        }else{
            return this.find({ uuid:{ $in: uuidArray } }, projection, { session });
        }
    }
    
    static findByToken(token, projection, session){
        if(session == undefined){
            return this.find({ token }, projection);
        }else{
            return this.find({ token }, projection, { session });
        }
    }
     
    static findByRefreshToken(refreshToken, projection, session){
        if(session == undefined){
            return this.find({ refreshToken }, projection);
        }else{
            return this.find({ refreshToken }, projection, { session });
        }
    }
     
    static findByResetToken(resetToken, projection, session){
        if(session == undefined){
            return this.find({ resetToken }, projection);
        }else{
            return this.find({ resetToken }, projection, { session });
        }
    }

    static findByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = StaffLogin = mongoose.model('StaffLogin', schema);