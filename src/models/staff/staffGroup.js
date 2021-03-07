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
    }
},{
    collection:"staffGroups"
});

class HelperClass{
    static findAllStaffGroup(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
    }
    static findStaffGroupById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateStaffGroupById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteStaffGroupById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static findAllStaffGroupByStaffIdArray(idArray, session){
        return this.find({ staffId:{ $in:idArray } },{ session:session });
    }

    static findStaffGroupByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "staffId": return this.find({staffId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static updateStaffGroupByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static deleteStaffGroupByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "staffId": return this.deleteMany({staffId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffGroup = mongoose.model('StaffGroup',schema);