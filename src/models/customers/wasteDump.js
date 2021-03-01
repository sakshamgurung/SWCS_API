const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:String,
        required:true,
        alias:"companyId"
    },
    customer_id:{
        type:String,
        required:true,
        alias:"customerId"
    },
    geo_object_id:{
        type:String,
        required:true,
        alias:"geoObjectId"
    },
    geo_object_checkpoints_id:{
        type:String,
        alias:"geoObjectCheckpointsId"
    },
    waste_list_id:{
        type:String,
        required:true,
        alias:"wasteListId"
    },
    amount:{
        type:Number,
        required:true
    },
    amount_unit:{
        type:String,
        required:true,
        alias:"amountUnit"
    },
    added_date:{
        type:Schema.Types.Date,
        required:true,
        alias:"addedDate"
    },
    collected_date:{
        type:Schema.Types.Date,
        alias:"collectedDate"
    },
    is_collected:{
        type:Boolean,
        alias:"isCollected"
    },
    archive:{
        type:{
            date:{
                type:Schema.Types.Date
            },
            coordinates:{ longitude:Number, latitude:Number },
            zone:[
                { 
                    coordinates:{longitude:Number, latitude:Number} 
                }
            ],
            waste_catalog:{
                type:String,
                alias:"wasteCatalog"
            }
        }
    }
},{
    collection:"waste_dump"
});

class HelperClass{
    static findAllWasteDump(customerId, companyId, session){
        return this.find({ $or:[{customer_id:customerId}, {company_id:companyId}] },{ session:session });
    }
    static findWasteDumpById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateWasteDumpById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteWasteDumpById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findWasteDumpByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.find({ customer_id:id },{ session:session });
            case "company-id": return this.find({ company_id:id },{ session:session });
            case "geo-object-id": return this.find({ geo_object_id:id },{ session:session });
            case "geo-object-checkpoints-id": return this.find({ geo_object_checkpoints_id:id },{ session:session });
            case "waste-list-id": return this.find({ waste_list_id:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateWasteDumpByRef(ref, id, updateData, session){
        switch(ref){
            case "customer-id": return this.updateMany({ customer_id:id },this.translateAliases( updateData ),{ session:session });
            case "company-id": return this.updateMany({ company_id:id },this.translateAliases( updateData ),{ session:session });
            case "geo-object-id": return this.updateMany({ geo_object_id:id },this.translateAliases( updateData ),{ session:session });
            case "geo-object-checkpoints-id": return this.updateMany({ geo_object_checkpoints_id:id },this.translateAliases( updateData ),{ session:session });
            case "waste-list-id": return this.updateMany({ waste_list_id:id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteWasteDumpByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.deleteMany({ customer_id:id },{ session:session });
            case "company-id": return this.deleteMany({ company_id:id },{ session:session });
            case "geo-object-id": return this.deleteMany({ geo_object_id:id },{ session:session });
            case "geo-object-checkpoints-id": return this.deleteMany({ geo_object_checkpoints_id:id },{ session:session });
            case "waste-list-id": return this.deleteMany({ waste_list_id:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteDump = mongoose.model('WasteDump',schema);