const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    waste_catalog_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"wasteCatalogId"
    },
    payment_type:{
        type:String,
        required:true,
        alias:"paymentType"
    },
    period:{
        type:String,
    },
    periodic_price:{
        type:Number,
        alias:"periodicPrice"
    },
    price:{
        type:Number
    },
    quantity:{
        type:Number
    },
    unit:{
        type:String
    }
},{
    collection:"waste_list"
});

class HelperClass{
    static findAllWasteList(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
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
    //new
    static findWasteListByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            case "waste-catalog-id": return this.find({waste_catalog_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateWasteListByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "waste-catalog-id": return this.updateMany({waste_catalog_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteWasteListByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "waste-catalog-id": return this.deleteMany({waste_catalog_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteList = mongoose.model('WasteList',schema);