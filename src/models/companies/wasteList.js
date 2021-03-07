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
        enum:["1 month","3 month", "6 month", "1 year"]
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
    static findAllWasteList(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
    }
    static findWasteListById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateWasteListById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteWasteListById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static findWasteListByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "wasteCatalogId": return this.find({wasteCatalogId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static updateWasteListByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "wasteCatalogId": return this.updateMany({wasteCatalogId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static deleteWasteListByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "wasteCatalogId": return this.deleteMany({wasteCatalogId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteList = mongoose.model('WasteList',schema);