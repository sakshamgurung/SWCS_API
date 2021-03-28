const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customerId:{
        type:String,
        required:true,
    },
    usedTrack:{
        type:[{
            _id:false,
            companyId:String,
            trackId:String
        }],
    }
},{
    collection:"customerUsedGeoObjects"
});

class HelperClass{
    
    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection);
                case "usedTrack.trackId": return this.find({$and:[{ "usedTrack.trackId":id }, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.find({$and:[{customerId:id}, query]}, projection, { session });
                case "usedTrack.trackId": return this.find({$and:[{ "usedTrack.trackId":id }, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
    
    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ));
                case "usedTrack.trackId": return this.updateMany({ "usedTrack.trackId":id },this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.updateMany({customerId:id},this.translateAliases( updateData ),{ session });
                case "usedTrack.trackId": return this.updateMany({ "usedTrack.trackId":id },this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
    
    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.deleteMany({customerId:id});
                case "usedTrack.trackId": return this.deleteMany({ "usedTrack.trackId":id });
                default: throw ApiError.badRequest("ref not defined");
            } 
        }else{
            switch(ref){
                case "customerId": return this.deleteMany({customerId:id},{ session });
                case "usedTrack.trackId": return this.deleteMany({ "usedTrack.trackId":id },{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerUsedGeoObject = mongoose.model('CustomerUsedGeoObject',schema);