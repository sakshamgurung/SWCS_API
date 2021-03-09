const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    companyType:{
        type:String,
        required:true,
        enum:["business", "individual"]
    },
    companyName:{
        type:String,
        required:true,
    },
    panNo:{
        type:Number,//9 digit
    },
    address:{
        province:String,
        district:String,
        city:String,
        wardNo:String,
        street:String
    },
    contactName:{
        firstName:String,
        lastName:String,
    },
    contactNo:{
        type:String,
    },
},{
    collection:"companyDetails"
});

class HelperClass{
    static findAllCompanyDetail(projection, session){
        if(session == undefined){
            return this.find({}, projection);
        }else{
            return this.find({}, projection, { session });
        }
    }
    
    static findCompanyDetailById(id, projection, session){
        if(session == undefined){
            return this.find({ _id:id }, projection);
        }else{
            return this.find({ _id:id }, projection, { session });
        }
    }

    static updateCompanyDetailById(id, updateData, session){
        if(session == undefined){
            return this.updateOne({ _id:id }, this.translateAliases( updateData ));
        }else{
            return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session });
        }
    }

    static deleteCompanyDetailById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session }); 
        }
    }
    
    static findCompanyDetailByRef(ref, id, projection, session){
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
}

schema.loadClass(HelperClass);

module.exports = CompanyDetail = mongoose.model('CompanyDetail',schema);