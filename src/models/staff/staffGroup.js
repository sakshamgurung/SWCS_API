const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    groupName:{
        type:String,
        required:true,
    },
    staffId:{
        type:[String],
    },
    description:{
        type:String
    },
    isReserved:{
        type:Boolean,
        required:true,
    }
},{
    collection:"staffGroups"
});

class HelperClass{
    static findAllStaffGroup(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection, { session });
        }
    }

    static findStaffGroupById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateStaffGroupById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }
    
    static deleteStaffGroupById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static findAllStaffGroupByStaffIdArray(idArray, projection, session){
        if(session == undefined){
            return this.find({ staffId:{ $in:idArray } }, projection);
        }else{
            return this.find({ staffId:{ $in:idArray } }, projection, { session });
        }
    }

    static findStaffGroupByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "staffId": return this.find({staffId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                case "staffId": return this.find({staffId:id}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateStaffGroupByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteStaffGroupByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "staffId": return this.deleteMany({staffId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "staffId": return this.deleteMany({staffId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffGroup = mongoose.model('StaffGroup',schema);