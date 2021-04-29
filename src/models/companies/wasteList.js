const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        ref:"CompanyLogin",
        required:true,
    },
    wasteCatalogId:{
        type:String,
        ref:"WasteCatalog",
        required:true,
    },
    paymentType:{
        type:String,
        required:true,
        enum:["none", "charge", "pay"]
    },
    period:{
        type:String,
        enum:["1 month","3 month", "6 month", "1 year"],
    },
    periodicPrice:{
        type:Number,
    },
    price:{
        type:Number
    },
    quantity:{
        type:Number
    },
    unit:{
        type:String,
        enum:["kg", "litre", "bora"]
    }
},{
    collection:"wasteLists"
});

class HelperClass{
    
    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection);
                case "wasteCatalogId": return this.find({$and:[{wasteCatalogId:id}, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection, { session });
                case "wasteCatalogId": return this.find({$and:[{wasteCatalogId:id}, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "wasteCatalogId": return this.updateMany({wasteCatalogId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "wasteCatalogId": return this.updateMany({wasteCatalogId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "wasteCatalogId": return this.deleteMany({wasteCatalogId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "wasteCatalogId": return this.deleteMany({wasteCatalogId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteList = mongoose.model('WasteList',schema);