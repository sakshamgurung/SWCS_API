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
    }
},{
    collection:"customer_login"
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
    //new
    static findCustomerByUUID(uuidArray, session){
        return this.find({ uuid:{ $in: uuidArray }  },{ session:session });
    }
    //new
    static findCustomerByToken(token, session){
        return this.find({ token:token },{ session:session });
    }
    //new 
    static findCustomerByRefreshToken(refreshToken, session){
        return this.find({ refresh_token: refreshToken },{ session:session });
    }
    //new
    static findCustomerByTimeStamp(timeStamp, session){
        return this.find({ time_stamp:timeStamp },{ session:session });
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerLogin = mongoose.model('CustomerLogin', schema);