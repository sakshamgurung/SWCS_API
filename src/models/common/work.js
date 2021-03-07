const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    activeDays:{
        type:[Boolean],//7 for 7 days of a week
    },
    startTime:{
        type:Schema.Types.Date,
    },
    endTime:{
        type:Schema.Types.Date,
    },
    isDateRange:{
        type:Boolean,
    },
    startDate:{
        type:Schema.Types.Date,
    },
    endDate:{
        type:Schema.Types.Date,
    },
    staffGroupId:{
        type:[String],
    },
    workTitle:{
        type:String,
    },
    workDescription:{
        type:String,
    },
    toDoList:{
        type:[
            {
                toDo:{
                    type:String,
                },
                completed:Boolean
            }
        ],
    },
    workStatus:{
        type:String,
        enum:["unconfirmed","confirmed","on progress","finished"]
    },
    vehicleId:{
        type:String,
    },
    geoObjectPointId:{
        type:[String],
    },
    geoObjectZoneId:{
        type:[String],
    }
},{
    collection:"works"
});

class HelperClass{
    static findAllWork(role, id, idArray, session){
        switch(role){
            case "company": return this.find({companyId:ObjectId(id)},{ session:session });
            case "staff":return this.find({staffGroupId:{ $in: idArray }},{ session:session });
            default : throw ApiError.badRequest("role not defined");
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
    static findWorkByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "staffGroupId": return this.find({staffGroupId:id},{ session:session });
            case "vehicleId": return this.find({vehicleId:id},{ session:session });
            case "geoObjectPointId": return this.find({geoObjectPointId:id},{ session:session });
            case "geoObjectZoneId": return this.find({geoObjectZoneId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    static updateWorkByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session:session });
            case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ),{ session:session });
            case "geoObjectPointId": return this.updateMany({geoObjectPointId:id},this.translateAliases( updateData ),{ session:session });
            case "geoObjectZoneId": return this.updateMany({geoObjectZoneId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    static deleteWorkByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session:session });
            case "vehicleId": return this.deleteMany({vehicleId:id},{ session:session });
            case "geoObjectPointId": return this.deleteMany({geoObjectPointId:id},{ session:session });
            case "geoObjectZoneId": return this.deleteMany({geoObjectZoneId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Work = mongoose.model('Work',schema);