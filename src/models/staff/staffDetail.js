const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:String,
        required:true,
        alias:"companyId"
    },
    staff_id:{
        type:String,
        required:true,
        alias:"staffId"
    },
    name:{
        first_name:{
            type:String,
            alias:"firstName"
        },
        last_name:{
            type:String,
            alias:"lastName"
        }
    },
    post_title:{
        type:String,
        alias:"postTitle"
    },
    staff_group_id:{
        type:[String],
        alias:"staffGroupId"
    },
    address:{
        provinces:String,
        district:String,
        city:String,
        ward_no:{
            type:String,
            alias:"wardNo"
        },
        street:String
    },
    contact_no:{
        type:String,
        alias:"contactNo"
    },
},{
    collection:"staff_detail"
});

class HelperClass{
    static findAllStaffDetail(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
    }
    static findStaffDetailById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateStaffDetailById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteStaffDetailById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static findAllStaffDetailByStaffGroupIdArray(idArray, session){
        return this.find({ staff_group_id:{ $in:idArray } },{ session:session });
    }
    //new
    static findStaffDetailByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            case "staff-id": return this.find({staff_id:id},{ session:session });
            case "staff-group-id": return this.find({staff_group_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static updateStaffDetailByRef(ref, id, updateData, session){
        switch(ref){
            case "company-id": return this.updateMany({company_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-id": return this.updateMany({staff_id:id},this.translateAliases( updateData ),{ session:session });
            case "staff-group-id": return this.updateMany({staff_group_id:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
    //new
    static deleteStaffDetailByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.deleteMany({company_id:id},{ session:session });
            case "staff-id": return this.deleteMany({staff_id:id},{ session:session });
            case "staff-group-id": return this.deleteMany({staff_group_id:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffDetail = mongoose.model('StaffDetail',schema);