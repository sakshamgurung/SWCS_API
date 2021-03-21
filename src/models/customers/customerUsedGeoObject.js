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
    
    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }
    
    static findByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.find({customerId:id}, projection);
                case "usedTrack.trackId": return this.find({ "usedTrack.trackId":id }, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.find({customerId:id}, projection, { session });
                case "usedTrack.trackId": return this.find({ "usedTrack.trackId":id }, projection, { session });
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