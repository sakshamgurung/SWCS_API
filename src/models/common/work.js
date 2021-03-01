const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    active_days:{
        type:[Boolean]//7 for 7 days of a week
    },
    start_time:{
        type:Schema.Types.Date,
        alias:"startTime"
    },
    end_time:{
        type:Schema.Types.Date,
        alias:"endTime"
    },
    is_date_range:{
        type:Boolean,
        alias:"isDateRange"
    },
    start_date:{
        type:Schema.Types.Date,
        alias:"startDate"
    },
    end_date:{
        type:Schema.Types.Date,
        alias:"endDate"
    },
    staff_id:{
        type:[String],
        alias:"staffId"
    },
    staff_group_id:{
        type:[String],
        alias:"staffGroupId"
    },
    work_description:{
        type:String,
        alias:"workDescription"
    },
    to_do_list:{
        type:[
            {
                to_do:{
                    type:String,
                    alias:"toDo"
                },
                completed:Boolean
            }
        ],
        alias:"toDoList"
    },
    work_status:{
        type:String,
        alias:"workStatus",
        enum:["unconfirmed","confirmed","on progress","finished"]
    },
    vehicle_id:{
        type:String,
        alias:"vehicleId"
    },
    geo_object_point_id:{
        type:[String],
        alias:"geoObjectPointId"
    },
    geo_object_track_id:{
        type:[String],
        alias:"geoObjectTrackId"
    },
    geo_object_zone_id:{
        type:[String],
        alias:"geoObjectZoneId"
    }
},{
    collection:"work"
});

class HelperClass{
    static findAllWork(role, id, idArray, session){
        switch(role){
            case "company": return this.find({company_id:ObjectId(id)},{ session:session });
            case "staff":return this.find({
                $or:[
                    { staff_id:{ $in: idArray.staffId } },//used while deleting staff or group 
                    { staff_group_id:{ $in: idArray.staffGroupId } } 
                ]
            },{ session:session });
        }
    }
    static findWorkById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateWorkById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session } );
    }
    static deleteWorkById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    
    //new
    static findWorkByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            case "staff-id": return this.find({staff_id:id},{ session:session });
            case "staff-group-id": return this.find({staff_group_id:id},{ session:session });
            case "vehicle-id": return this.find({vehicle_id:id},{ session:session });
            case "geo-object-point-id": return this.find({geo_object_point_id:id},{ session:session });
            case "geo-object-track-id": return this.find({geo_object_track_id:id},{ session:session });
            case "geo-object-zone-id": return this.find({geo_object_zone_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateWorkByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-id": return this.updateMany({staff_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-group-id": return this.updateMany({staff_group_id:id},this.translateAliases( updateData ),{ session:session });
            case "vehicle-id": return this.updateMany({vehicle_id:id},this.translateAliases( updateData ),{ session:session });
            case "geo-object-point-id": return this.updateMany({geo_object_point_id:id},this.translateAliases( updateData ),{ session:session });
            case "geo-object-track-id": return this.updateMany({geo_object_track_id:id},this.translateAliases( updateData ),{ session:session });
            case "geo-object-zone-id": return this.updateMany({geo_object_zone_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteWorkByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "staff-id": return this.deleteMany({staff_id:id},{ session:session });
            case "staff-group-id": return this.deleteMany({staff_group_id:id},{ session:session });
            case "vehicle-id": return this.deleteMany({vehicle_id:id},{ session:session });
            case "geo-object-point-id": return this.deleteMany({geo_object_point_id:id},{ session:session });
            case "geo-object-track-id": return this.deleteMany({geo_object_track_id:id},{ session:session });
            case "geo-object-zone-id": return this.deleteMany({geo_object_zone_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = WorkDetail = mongoose.model('WorkDetail',schema);