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
    static findAll(projection, session){
        if(session == undefined){
            return this.find({}, projection);
        }else{
            return this.find({}, projection, { session });
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
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
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
                default : throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "companyId": return this.find({companyId:id}, projection, { session });
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