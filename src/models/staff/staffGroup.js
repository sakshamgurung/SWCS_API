const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        ref:"CompanyLogin",
        required:true,
    },
    groupName:{
        type:String,
        required:true,
    },
    staffId:[
        {
            type:String, 
            ref:"StaffLogin",
        },
    ],
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
    static findAllByStaffIdArray(idArray, query, projection, session){
        if(session == undefined){
            return this.find({ $and:[{staffId:{ $in:idArray }}, query] }, projection);
        }else{
            return this.find({ $and:[{staffId:{ $in:idArray }}, query] }, projection, { session });
        }
    }

    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find( {$and:[{companyId:id}, query] }, projection);
                case "staffId": return this.find( {$and:[{staffId:id}, query]}, projection);
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find( {$and:[{companyId:id}, query]}, projection, { session });
                case "staffId": return this.find( {$and:[{staffId:id}, query]}, projection, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static updateByRef(ref, id, updateData, session){
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

    static deleteByRef(ref, id, session){
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