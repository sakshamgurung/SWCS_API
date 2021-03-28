const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    customerType:{
        type:[String],//["business","individual"]
        required:true,
    },
    serviceType:{
        type:[String],//["subscription", "subscription with location", "one time"]
        required:true,
    },
},{
    collection:"companyServiceDetails"
});

class HelperClass{
    static findByRef(ref, id, query, projection, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection);
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({$and:[{companyId:id}, query]}, projection, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "companyId": return this.deleteOne({companyId:id});
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.deleteOne({companyId:id}, { session });
                default : throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyServiceDetail = mongoose.model('CompanyServiceDetail',schema);