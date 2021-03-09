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
        type:String
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
    collection:"customerLogins"
});

class HelperClass{
    static findAllCustomerInIdArray(idArray, projection, session){
        if(session == undefined){
            return this.find({ _id:{ $in:idArray } }, projection); 
        }else{
            return this.find({ _id:{ $in:idArray } }, projection, { session });
        }
    }
    
    static findCustomerById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }
    
    static updateCustomerById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteCustomerById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findCustomerByEmail(email, projection, session){
        if(session == undefined){
            return this.find({ email}, projection);
        }else{
            return this.find({ email}, projection, { session });
        }
    }

    static findCustomerByMobileNo(mobileNo, projection, session){
        if(session == undefined){
            return this.find({ mobileNo}, projection);
        }else{
            return this.find({ mobileNo}, projection, { session });
        }
    }

    static findCustomerByUUID(uuidArray, projection, session){
        if(session == undefined){
            return this.find({ uuid:{ $in: uuidArray }  }, projection);
        }else{
            return this.find({ uuid:{ $in: uuidArray }  }, projection, { session });
        }
    }

    static findCustomerByToken(token, projection, session){
        if(session == undefined){
            return this.find({ token }, projection);
        }else{
            return this.find({ token }, projection, { session });
        }
    }

    static findCustomerByRefreshToken(refreshToken, projection, session){
        if(session == undefined){
            return this.find({ refreshToken }, projection);
        }else{
            return this.find({ refreshToken }, projection, { session });
        }
    }

    static findCustomerByResetToken(resetToken, projection, session){
        if(session == undefined){
            return this.find({ resetToken }, projection);
        }else{
            return this.find({ resetToken }, projection, { session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerLogin = mongoose.model('CustomerLogin', schema);