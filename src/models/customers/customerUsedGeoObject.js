const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    customer_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"customerId"
    },
    used_point:{
        type:[{
            company_id:{
                type:Schema.Types.ObjectId,
                alias:"companyId"
            },
            point_id:{
                type:Schema.Types.ObjectId,
                alias:"pointId"
            }
        }],
        alias:"usedPoint"
    },
    used_track:{
        type:[{
            company_id:{
                type:Schema.Types.ObjectId,
                alias:"companyId"
            },
            track_id:{
                type:Schema.Types.ObjectId,
                alias:"trackId"
            },
            track_checkpoints_id:{
                type:Schema.Types.ObjectId,
                alias:"trackCheckpointsId"
            }
        }],
        alias:"usedTrack"
    },
    used_zone:{
        type:[{
            company_id:{
                type:Schema.Types.ObjectId,
                alias:"companyId"
            },
            zone_id:{
                type:Schema.Types.ObjectId,
                alias:"zoneId"
            }
        }],
        alias:"usedZone"
    }
},{
    collection:"customer_used_geo_object"
});

class HelperClass{
    static findAllCustomerUsedGeoObject(customerId, session){
        return this.find({ customer_id:customerId },{ session:session });
    }
    static updateCustomerUsedGeoObjectById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCustomerUsedGeoObjectById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findCustomerUsedGeoObjectById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    //new
    static findCustomerUsedGeoObjectByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.find({customer_id:id},{ session:session });
            case "used-point.point-id": return this.find({ "used_point.point_id":id},{ session:session });
            case "used-track.track-id": return this.find({ "used_track.track_id":id },{ session:session });
            case "used-zone.zone-id": return this.find({ "used_zone.zone_id":id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateCustomerUsedGeoObjectByRef(ref, id, updateData, session){
        switch(ref){
            case "customer-id": return this.updateMany({customer_id:id},this.translateAliases( updateData ),{ session:session });
            case "used-point.point-id": return this.updateMany({ "used_point.point_id":id},this.translateAliases( updateData ),{ session:session });
            case "used-track.track-id": return this.updateMany({ "used_track.track_id":id },this.translateAliases( updateData ),{ session:session });
            case "used-zone.zone-id": return this.updateMany({ "used_zone.zone_id":id },this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteCustomerUsedGeoObjectByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.deleteMany({customer_id:id},{ session:session });
            case "used-point.point-id": return this.deleteMany({ "used_point.point_id":id},{ session:session });
            case "used-track.track-id": return this.deleteMany({ "used_track.track_id":id },{ session:session });
            case "used-zone.zone-id": return this.deleteMany({ "used_zone.zone_id":id },{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CustomerUsedGeoObject = mongoose.model('CustomerUsedGeoObject',schema);