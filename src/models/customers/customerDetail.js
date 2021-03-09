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
    static findAllCustomerDetailInIdArray(idArray, projection, session){
        if(session == undefined){
            return this.find({ _id:{ $in:idArray } }, projection);
            
        }else{
            return this.find({ _id:{ $in:idArray } }, projection, { session });
         
        }
    }

    static findCustomerDetailById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
            
        }else{
            return this.find({ _id:id }, projection, { session });
         
        }
    }

    static updateCustomerDetailById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
            
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
         
        }
    }

    static deleteCustomerDetailById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
            
        }else{
            return this.deleteOne({ _id:id }, { session });
         
        }
    }

    static findCustomerDetailByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({customerId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.find({customerId:id}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerDetail = mongoose.model('CustomerDetail',schema);