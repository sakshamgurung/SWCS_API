const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
    },
    trackName:{
        type:String,
    },
    trackPoints:[
        {coordinates:{longitude:Number, latitude:Number}}],
    workId:{
        type:String,
    },
    wasteLimit:{
        type:Number
    },
    wasteLimitUnit:{
        type:String,
        enum:["kg", "litre", "bora"]
    },
    wasteCondition:{
        type:String,
        enum:["none", "low", "medium", "high"]
    },
    description:{
        type:String
    }
},{
    collection:"geoObjectTracks"
});

class HelperClass{
    static findAllGeoObject(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
    }
    static findGeoObjectById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateGeoObjectById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteGeoObjectById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findGeoObjectByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "workId": return this.find({workId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateGeoObjectByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "workId": return this.updateMany({workId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteGeoObjectByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "workId": return this.deleteMany({workId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.index({"trackPoints.coordinates":'2d'});
schema.loadClass(HelperClass);

module.exports = Track = mongoose.model('Track', schema);