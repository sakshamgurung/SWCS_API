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
    static findAll( projection, session){
        if(session == undefined){
            return this.find({}, projection);
        }else{
            return this.find({}, projection,{ session });
        }
    }

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection,{ session });
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
            return this.find({ uuid:{ $in: uuidArray }}, projection);
        }else{
            return this.find({ uuid:{ $in: uuidArray }}, projection, { session });  
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
}

schema.loadClass(HelperClass);

module.exports = CompanyLogin = mongoose.model('CompanyLogin', schema);