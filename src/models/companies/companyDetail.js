const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    company_type:{
        type:String,//"registered company", "individual"
        required:true,
        alias:"companyType"
    },
    company_name:{
        type:String,
        alias:"companyName"
    },
    pan_no:{
        type:Number,//9 digit
        alias:"panNo"
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
    contact_name:{
        first_name:{
            type:String,
            alias:"firstName"
        },
        last_name:{
            type:String,
            alias:"lastName"
        },
        alias:"contactName"
    },
    contact_no:{
        type:String,
        alias:"contactNo"
    },
},{
    collection:"company_detail"
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
    
    //new
    static findCompanyDetailByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            default: return this.find({},{ session:session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyDetail = mongoose.model('CompanyDetail',schema);