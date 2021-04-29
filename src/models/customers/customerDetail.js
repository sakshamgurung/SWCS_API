const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        ref:"CustomerLogin",
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
    static findAllInIdArray(idArray, query, projection, session){
        if(session == undefined){
            return this.find({ $and:[{customerId:{ $in:idArray }}, query] }, projection);
            
        }else{
            return this.find({ $and:[{customerId:{ $in:idArray }}, query] }, projection, { session });
         
        }
    }

    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }
    
    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.deleteOne({customerId:id});
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.deleteOne({customerId:id}, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerDetail = mongoose.model('CustomerDetail',schema);