const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        ref:"CompanyLogin",
        required:true,
    },
    customerId:{
        type:String,
        ref:"CustomerLogin",
        required:true,
    },
    geoObjectType:{
        type:String,
        enum:["track"]
    },
    geoObjectId:{
        type:String,
        required:true,
    },
    wasteListId:{
        type:String,
        ref:"WasteList",
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
            coordinates:{ identifiers:String, coordinates:{ longitude:Number, latitude:Number} },
            track:[
                {   _id:false,
                    identifiers:String,
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

    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({$and:[{ customerId:id }, query]}, projection);
                case "companyId": return this.find({$and:[{ companyId:id }, query]}, projection);
                case "geoObjectId": return this.find({$and:[{ geoObjectId:id }, query]}, projection);
                case "wasteListId": return this.find({$and:[{ wasteListId:id }, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.find({$and:[{ customerId:id }, query]}, projection, { session });
                case "companyId": return this.find({$and:[{ companyId:id }, query]}, projection, { session });
                case "geoObjectId": return this.find({$and:[{ geoObjectId:id }, query]}, projection, { session });
                case "wasteListId": return this.find({$and:[{ wasteListId:id }, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.updateMany({ customerId:id },this.translateAliases( updateData ));
                case "companyId": return this.updateMany({ companyId:id },this.translateAliases( updateData ));
                case "geoObjectId": return this.updateMany({ geoObjectId:id },this.translateAliases( updateData ));
                case "wasteListId": return this.updateMany({ wasteListId:id },this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.updateMany({ customerId:id },this.translateAliases( updateData ),{ session });
                case "companyId": return this.updateMany({ companyId:id },this.translateAliases( updateData ),{ session });
                case "geoObjectId": return this.updateMany({ geoObjectId:id },this.translateAliases( updateData ),{ session });
                case "wasteListId": return this.updateMany({ wasteListId:id },this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id });
                case "companyId": return this.deleteMany({ companyId:id });
                case "geoObjectId": return this.deleteMany({ geoObjectId:id });
                case "wasteListId": return this.deleteMany({ wasteListId:id });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id },{ session });
                case "companyId": return this.deleteMany({ companyId:id },{ session });
                case "geoObjectId": return this.deleteMany({ geoObjectId:id },{ session });
                case "wasteListId": return this.deleteMany({ wasteListId:id },{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WasteDump = mongoose.model('WasteDump',schema);