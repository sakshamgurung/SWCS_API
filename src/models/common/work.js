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
        type:String,
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
    geoObjectTrackId:{
        type:[String],
    }
},{
    collection:"works"
});

class HelperClass{
    static findAllWork(role, id, projection, session){
        if(session == undefined){
            switch(role){
                case "company": return this.find({companyId:id}, projection);
                case "staff":return this.find({staffGroupId:id}, projection);
                default : throw ApiError.badRequest("role not defined");
            }
            
        }else{
            switch(role){
                case "company": return this.find({companyId:id}, projection, { session });
                case "staff":return this.find({staffGroupId:id}, projection, { session });
                default : throw ApiError.badRequest("role not defined");
            }
            
        }
    }

    static findWorkById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
            
        }else{
            return this.find({ _id:id }, projection, { session });
            
        }
    }

    static updateWorkById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ) );
            
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session } );
            
        }
    }

    static deleteWorkById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
            
        }else{
            return this.deleteOne({ _id:id }, { session });
            
        }
    }

    static findWorkByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "staffGroupId": return this.find({staffGroupId:id}, projection);
                case "vehicleId": return this.find({vehicleId:id}, projection);
                case "geoObjectPointId": return this.find({geoObjectPointId:id}, projection);
                case "geoObjectTrackId": return this.find({geoObjectTrackId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection,{ session });
                case "staffGroupId": return this.find({staffGroupId:id}, projection,{ session });
                case "vehicleId": return this.find({vehicleId:id}, projection,{ session });
                case "geoObjectPointId": return this.find({geoObjectPointId:id}, projection,{ session });
                case "geoObjectTrackId": return this.find({geoObjectTrackId:id}, projection,{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }

    static updateWorkByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ));
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ));
                case "geoObjectPointId": return this.updateMany({geoObjectPointId:id},this.translateAliases( updateData ));
                case "geoObjectTrackId": return this.updateMany({geoObjectTrackId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session });
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ),{ session });
                case "geoObjectPointId": return this.updateMany({geoObjectPointId:id},this.translateAliases( updateData ),{ session });
                case "geoObjectTrackId": return this.updateMany({geoObjectTrackId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }
    
    static deleteWorkByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "staffGroupId": return this.deleteMany({staffGroupId:id});
                case "vehicleId": return this.deleteMany({vehicleId:id});
                case "geoObjectPointId": return this.deleteMany({geoObjectPointId:id});
                case "geoObjectTrackId": return this.deleteMany({geoObjectTrackId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session });
                case "vehicleId": return this.deleteMany({vehicleId:id},{ session });
                case "geoObjectPointId": return this.deleteMany({geoObjectPointId:id},{ session });
                case "geoObjectTrackId": return this.deleteMany({geoObjectTrackId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Work = mongoose.model('Work',schema);