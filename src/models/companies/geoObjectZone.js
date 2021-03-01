const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        alias:"companyId"
    },
    zone_name:{
        type:String,
        alias:"zoneName"
    },
    zone_points:[
        {
            coordinates:{longitude:Number, latitude:Number},
        }
    ],
    work_id:{
        type:String,
        alias:"workId"
    },
    waste_condition:{
        type:String,
        alias:"wasteCondition"
    },
    description:{
        type:String
    }
},{
    collection:"geo_object_zone"
});

class HelperClass{
    static findAllGeoObject(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
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
            case "company-id": return this.find({company_id:id},{ session:session });
            case "work-id": return this.find({work_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateGeoObjectByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "work-id": return this.updateMany({work_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteGeoObjectByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "work-id": return this.deleteMany({work_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.index({"zone_points.coordinates":'2d'});
schema.loadClass(HelperClass);

module.exports = Zone = mongoose.model('Zone', schema);