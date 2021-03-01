const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    group_name:{
        type:String,
        required:true,
        alias:"groupName"
    },
    staff_id:{
        type:[String],
        alias:"staffId"
    },
    description:{
        type:String
    }
},{
    collection:"staff_group"
});

class HelperClass{
    static findAllStaffGroup(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
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
    //new
    static findAllStaffGroupByStaffIdArray(idArray, session){
        return this.find({ staff_id:{ $in:idArray } },{ session:session });
    }
    //new
    static findStaffGroupByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            case "staff-id": return this.find({staff_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateStaffGroupByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-id": return this.updateMany({staff_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteStaffGroupByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "staff-id": return this.deleteMany({staff_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffGroup = mongoose.model('StaffGroup',schema);