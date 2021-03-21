const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    wasteCatalogId:{
        type:String,
        required:true,
    },
    paymentType:{
        type:String,
        required:true,
        enum:["none", "charge", "pay"]
    },
    period:{
        type:String,
        enum:["","1 month","3 month", "6 month", "1 year"],
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
        enum:["","kg", "litre", "bora"]
    }
},{
    collection:"wasteLists"
});

class HelperClass{
    static findAll(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
        }
    }

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "wasteCatalogId": return this.find({wasteCatalogId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                case "wasteCatalogId": return this.find({wasteCatalogId:id}, projection, { session });
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