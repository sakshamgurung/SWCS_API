const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customer_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"customerId"
    },
    customer_type:{
        type:String,
        required:true,
        alias:"customerType"
    },
    business_name:{
        type:String,
        alias:"businessName"
    },
    address:{
        provinces:String,
        district:String,
        city:String,
        ward_no:{
            type:String,
            alias:"wardNo"
        },
        street:String
    },
    contact_name:{
        first_name:{
            type:String,
            alias:"firstName"
        },
        last_name:{
            type:String,
            alias:"lastName"
        },
        alias:"contactName"
    },
    contact_no:{
        type:String,
        alias:"contactNo"
    },
},{
    collection:"customer_detail"
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
    //new
    static findCustomerDetailByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.find({customer_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerDetail = mongoose.model('CustomerDetail',schema);