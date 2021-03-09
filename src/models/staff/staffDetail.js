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
    static findAllStaffDetail(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
            
        }else{
            return this.find({ companyId }, projection, { session });
            
        }
    }

    static findStaffDetailById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
            
        }else{
            return this.find({ _id:id }, projection, { session });
            
        }
    }

    static updateStaffDetailById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
            
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
            
        }
    }
    
    static deleteStaffDetailById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
            
        }else{
            return this.deleteOne({ _id:id }, { session });
            
        }
    }

    static findAllStaffDetailByStaffGroupIdArray(idArray, projection, session){
        if(session == undefined){
            return this.find({ staffGroupId:{ $in:idArray } }, projection);
            
        }else{
            return this.find({ staffGroupId:{ $in:idArray } }, projection, { session });
            
        }
    }

    static findStaffDetailByRef(ref, id, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection);
                case "staffId": return this.find({staffId:id}, projection);
                case "staffGroupId": return this.find({staffGroupId:id}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
                case "staffId": return this.find({staffId:id}, projection, { session });
                case "staffGroupId": return this.find({staffGroupId:id}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }

    static updateStaffDetailByRef(ref, id, updateData, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ));
                case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ));
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ));
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.updateMany({companyId:id},this.translateAliases( updateData ),{ session });
                case "staffId": return this.updateMany({staffId:id},this.translateAliases( updateData ),{ session });
                case "staffGroupId": return this.updateMany({staffGroupId:id},this.translateAliases( updateData ),{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }

    static deleteStaffDetailByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id});
                case "staffId": return this.deleteMany({staffId:id});
                case "staffGroupId": return this.deleteMany({staffGroupId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }else{
            switch(ref){
                case "companyId": return this.deleteMany({companyId:id},{ session });
                case "staffId": return this.deleteMany({staffId:id},{ session });
                case "staffGroupId": return this.deleteMany({staffGroupId:id},{ session });
                default: throw ApiError.badRequest("ref not defined");
            }
            
        }
    }

}

schema.loadClass(HelperClass);

module.exports = StaffDetail = mongoose.model('StaffDetail',schema);