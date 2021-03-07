const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        required:true,
    },
    customerType:{
        type:String,
        required:true,
        enum:["business","individual"]
    },
    businessName:{
        type:String,
    },
    address:{
        province:String,
        district:String,
        city:String,
        wardNo:String,
        street:String
    },
    contactName:{
        firstName:String,
        lastName:String,
    },
    contactNo:{
        type:String,
    },
},{
    collection:"customerDetails"
});

class HelperClass{
    static findAllCustomerDetailInIdArray(idArray, session){
        return this.find({ _id:{ $in:idArray } },{ session:session });
    }
    static findCustomerDetailById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCustomerDetailById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerDetailById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static findCustomerDetailByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.find({customerId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerDetail = mongoose.model('CustomerDetail',schema);