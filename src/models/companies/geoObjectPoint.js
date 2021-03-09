const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
    },
    pointName:{
        type:String,
    },
    coordinates:{longitude:Number, latitude:Number},
    workId:{
        type:String,
    },
    wasteLimit:{
        type:Number
    },
    wasteLimitUnit:{
        type:String,
        enum:["kg"]
    },
    wasteCondition:{
        type:String,
        enum:["none", "low", "medium", "high"]
    },
    description:{
        type:String
    }
},{
    collection:"geoObjectPoints"
});

class HelperClass{
    static findAllGeoObject(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
        }
    }

    static findGeoObjectById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateGeoObjectById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }
    
    static deleteGeoObjectById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findGeoObjectByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "workId": return this.find({workId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                case "workId": return this.find({workId:id}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateGeoObjectByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "workId": return this.updateMany({workId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "workId": return this.updateMany({workId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteGeoObjectByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "workId": return this.deleteMany({workId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "workId": return this.deleteMany({workId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
    
}

schema.index({"coordinates":'2d'});
schema.loadClass(HelperClass);

module.exports = Point = mongoose.model('Point', schema);