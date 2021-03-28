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
    requestCoordinate:{
        type:{identifier:String, coordinates:{latitude:Number, longitude:Number}},
    },
    subscribedGeoObjectType:{
        type:String,
        enum:["track"]
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
        type:String
    },
    wasteDescription:{
        type:[ {_id:false, wasteListId:String, amount:Number, amountUnit:String } ],//"litre", "kg","bora"
    },
    staffGroupId:{
        type:String,
    },
    vehicleId:{
        type:String,
    },
    requestStatus:{
        type:String,
        enum:["pending","accepted","assigned","finished"]
    }
},{
    collection:"customerRequests"
});

class HelperClass{
    static findAll(role, id, query, projection, session){
        if(session == undefined){
            switch(role){
                case "company": return this.find({$and:[{companyId:id}, query]}, projection); 
                case "customer": return this.find({$and:[{customerId:id}, query]}, projection);
                case "staff": return this.find({$and:[{staffGroupId:id}, query]}, projection);
                default : throw ApiError.badRequest("role not defined");
            }
        }else{
            switch(role){
                case "company": return this.find({$and:[{companyId:id}, query]}, projection, { session }); 
                case "customer": return this.find({$and:[{customerId:id}, query]}, projection, { session });
                case "staff": return this.find({$and:[{staffGroupId:id}, query]}, projection, { session });
                default : throw ApiError.badRequest("role not defined");
            }
        }
    }

    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection);
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection);
                case "staffGroupId": return this.find({$and:[{staffGroupId:id}, query]}, projection);
                case "vehicleId": return this.find({$and:[{vehicleId:id}, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }  
        }else{
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection, { session });
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection, { session });
                case "staffGroupId": return this.find({$and:[{staffGroupId:id}, query]}, projection, { session });
                case "vehicleId": return this.find({$and:[{vehicleId:id}, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ));
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ));
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ),{ session });
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session });
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "customerId": return this.deleteMany({customerId:id});
                case "staffGroupId": return this.deleteMany({staffGroupId:id});
                case "vehicleId": return this.deleteMany({vehicleId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "customerId": return this.deleteMany({customerId:id},{ session });
                case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session });
                case "vehicleId": return this.deleteMany({vehicleId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerRequest = mongoose.model('CustomerRequest',schema);