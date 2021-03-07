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
    static findAllCustomerInIdArray(idArray, session){
        return this.find({ _id:{ $in:idArray } },{ session:session });
    }
    static findCustomerById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCustomerById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static findCustomerByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray }  },{ session:session });
    }

    static findCustomerByToken(token, session){
        return this.find({ token:token },{ session:session });
    }

    static findCustomerByRefreshToken(refreshToken, session){
        return this.find({ refreshToken: refreshToken },{ session:session });
    }

    static findCompanyByResetToken(resetToken, session){
        return this.find({ resetToken: resetToken },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerLogin = mongoose.model('CustomerLogin', schema);