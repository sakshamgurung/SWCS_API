const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    static findAllCompanyDetail(session){
        return this.find({},{ session:session });
    }
    static findCompanyDetailById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCompanyDetailById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCompanyDetailById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    static findCompanyDetailByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            default: return this.find({},{ session:session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyDetail = mongoose.model('CompanyDetail',schema);