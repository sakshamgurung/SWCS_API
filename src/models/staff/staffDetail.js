const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    staffId:{
        type:String,
        required:true,
    },
    personalId:{
        type:{
            idType:String,//citizenship, driver licence, passport
            idNo:String
        },
    },
    name:{
        firstName:String,
        lastName:String
    },
    postTitle:{
        type:String,
    },
    staffGroupId:{
        type:String,
    },
    address:{
        province:String,
        district:String,
        city:String,
        wardNo:String,
        street:String
    },
    contactNo:{
        type:String,
    },
},{
    collection:"staffDetails"
});

class HelperClass{
    static findAllStaffDetail(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
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

    static findAllStaffDetailByStaffGroupIdArray(idArray, session){
        return this.find({ staffGroupId:{ $in:idArray } },{ session:session });
    }

    static findStaffDetailByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            case "staffId": return this.find({staffId:id},{ session:session });
            case "staffGroupId": return this.find({staffGroupId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static updateStaffDetailByRef(ref, id, updateData, session){
        switch(ref){
            case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session:session });
            case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ),{ session:session });
            case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

    static deleteStaffDetailByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.deleteMany({companyId:id},{ session:session });
            case "staffId": return this.deleteMany({staffId:id},{ session:session });
            case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffDetail = mongoose.model('StaffDetail',schema);