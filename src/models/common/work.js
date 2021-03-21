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
        type:String,
    },
    endTime:{
        type:String,
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
            {   _id:false,
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
    geoObjectTrackId:{
        type:[String],
    }
},{
    collection:"works"
});

class HelperClass{
    static findAll(role, id, projection, session){
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

    static findById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
            
        }else{
            return this.find({ _id:id }, projection, { session });
            
        }
    }

    static updateById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ) );
            
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session } );
            
        }
    }

    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
            
        }else{
            return this.deleteOne({ _id:id }, { session });
            
        }
    }

    static findByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "staffGroupId": return this.find({staffGroupId:id}, projection);
                case "vehicleId": return this.find({vehicleId:id}, projection);
                case "geoObjectTrackId": return this.find({geoObjectTrackId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection,{ session });
                case "staffGroupId": return this.find({staffGroupId:id}, projection,{ session });
                case "vehicleId": return this.find({vehicleId:id}, projection,{ session });
                case "geoObjectTrackId": return this.find({geoObjectTrackId:id}, projection,{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }

    static updateByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ));
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ));
                case "geoObjectTrackId": return this.updateMany({geoObjectTrackId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session });
                case "vehicleId": return this.updateMany({vehicleId:id},this.translateAliases( updateData ),{ session });
                case "geoObjectTrackId": return this.updateMany({geoObjectTrackId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }
    
    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "staffGroupId": return this.deleteMany({staffGroupId:id});
                case "vehicleId": return this.deleteMany({vehicleId:id});
                case "geoObjectTrackId": return this.deleteMany({geoObjectTrackId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session });
                case "vehicleId": return this.deleteMany({vehicleId:id},{ session });
                case "geoObjectTrackId": return this.deleteMany({geoObjectTrackId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Work = mongoose.model('Work',schema);