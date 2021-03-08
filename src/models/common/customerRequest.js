const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    customerId:{
        type:String,
        required:true,
    },
    requestType:{
        type:String,
        required:true,
        enum:["subscription", "subscription with location", "one time"]
    },
    pointName:{
        type:String,
    },
    pointDescription:{
        type:String
    },
    requestCoordinate:{
        type:{latitude:Number, longitude:Number},
    },
    subscribedGeoObjectId:{
        type:String,
    },
    workDescription:{
        type:String,
    },
    date:{
        type:Schema.Types.Date
    },
    time:{
        type:Schema.Types.Date
    },
    wasteDescription:{
        type:[ { wasteListId:String, amount:Number, amountUnit:String } ],//"litre", "kg","bora"
    },
    staffGroupId:{
        type:[String],
    },
    vehicleId:{
        type:String,
    },
    requestStatus:{
        type:String,
        enum:["pending","confirmed","finished"]
    }
},{
    collection:"customerRequests"
});

class HelperClass{
    static findAllCustomerRequest(role, id, idArray, session){
        switch(role){
            case "company": return this.find({companyId:id},{ session:session }); 
            case "customer": return this.find({customerId:id},{ session:session });
            case "staff": return this.find({staffGroupId:{ $in: idArray}},{ session:session });
            default : throw ApiError.badRequest("role not defined");
        }
    }
    static findCustomerRequestById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCustomerRequestById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerRequestById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    static findCustomerRequestByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "customerId": return this.find({customerId:id},{ session:session });
            case "staffGroupId": return this.find({staffGroupId:id},{ session:session });
            case "vehicleId": return this.find({vehicleId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    static updateCustomerRequestByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ),{ session:session });
            case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session:session });
            case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    static deleteCustomerRequestByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "customerId": return this.deleteMany({customerId:id},{ session:session });
            case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session:session });
            case "vehicleId": return this.deleteMany({vehicleId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerRequest = mongoose.model('CustomerRequest',schema);