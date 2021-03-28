const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
    },
    zoneName:{
        type:String,
    },
    zonePoints:[
        {_id:false, identifier:String, coordinates:{longitude:Number, latitude:Number}}
    ],
    // workId:{
    //     type:String,
    // },
    // wasteCondition:{
    //     type:String,
    //     enum:["none", "low", "medium", "high"]
    // },
    description:{
        type:String
    }
},{
    collection:"geoObjectZones"
});

class HelperClass{
    
    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find( { $and:[{companyId:id}, query] }, projection);
                //case "workId": return this.find( { $and:[{workId:id}, query] }, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find( { $and:[{companyId:id}, query] }, projection, { session });
                //case "workId": return this.find( { $and:[{workId:id}, query] }, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                //case "workId": return this.updateMany({workId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                //case "workId": return this.updateMany({workId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                //case "workId": return this.deleteMany({workId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                //case "workId": return this.deleteMany({workId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.index({"zonePoints.coordinates":'2d'});
schema.loadClass(HelperClass);

module.exports = Zone = mongoose.model('Zone', schema);