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
    geoObjectId:{
        type:String,
        required:true,
    },
    wasteListId:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true
    },
    amountUnit:{
        type:String,
        required:true,
        enum:["kg", "litre", "bora"]
    },
    addedDate:{
        type:Schema.Types.Date,
        required:true,
    },
    collectedDate:{
        type:Schema.Types.Date,
    },
    isCollected:{
        type:Boolean,
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
            wasteCatalog:String
        }
    }
},{
    collection:"wasteDumps"
});

class HelperClass{
    static findWasteDumpById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateWasteDumpById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteWasteDumpById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static findWasteDumpByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.find({ customerId:id },{ session:session });
            case "companyId": return this.find({ companyId:id },{ session:session });
            case "geoObjectId": return this.find({ geoObjectId:id },{ session:session });
            case "wasteListId": return this.find({ wasteListId:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static updateWasteDumpByRef(ref, id, updateData, session){
        switch(ref){
            case "customerId": return this.updateMany({ customerId:id },this.translateAliases( updateData ),{ session:session });
            case "companyId": return this.updateMany({ companyId:id },this.translateAliases( updateData ),{ session:session });
            case "geoObjectId": return this.updateMany({ geoObjectId:id },this.translateAliases( updateData ),{ session:session });
            case "wasteListId": return this.updateMany({ wasteListId:id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static deleteWasteDumpByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.deleteMany({ customerId:id },{ session:session });
            case "companyId": return this.deleteMany({ companyId:id },{ session:session });
            case "geoObjectId": return this.deleteMany({ geoObjectId:id },{ session:session });
            case "wasteListId": return this.deleteMany({ wasteListId:id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteDump = mongoose.model('WasteDump',schema);