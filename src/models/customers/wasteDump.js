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
    geoObjectType:{
        type:String,
        enum:["track", "point"]
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
            track:[
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
    static findWasteDumpById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
            
        }else{
            return this.find({ _id:id }, projection, { session });
         
        }
    }

    static updateWasteDumpById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
            
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
         
        }
    }

    static deleteWasteDumpById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
            
        }else{
            return this.deleteOne({ _id:id }, { session });
         
        }
    }

    static findWasteDumpByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({ customerId:id }, projection);
                case "companyId": return this.find({ companyId:id }, projection);
                case "geoObjectId": return this.find({ geoObjectId:id }, projection);
                case "wasteListId": return this.find({ wasteListId:id }, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "customerId": return this.find({ customerId:id }, projection, { session });
                case "companyId": return this.find({ companyId:id }, projection, { session });
                case "geoObjectId": return this.find({ geoObjectId:id }, projection, { session });
                case "wasteListId": return this.find({ wasteListId:id }, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
         
        }
    }

    static updateWasteDumpByRef(ref, id, updateData, session){
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

    static deleteWasteDumpByRef(ref, id, session){
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