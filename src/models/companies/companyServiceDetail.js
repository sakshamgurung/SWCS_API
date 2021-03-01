const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true,
        alias:"companyId"
    },
    customer_type:{
        type:[String],//"business", "individual"
        required:true,
        alias:"companyType"
    },
    service_type:{
        type:[String],//"subscription", "on demand"
        required:true,
        alias:"serviceType"
    },
    request_needed:{
        type:Boolean,
        required:true,
        alias:"requestNeeded"
    },
    pick_up:{
        type:[String],//"door to door, "pre-definded location and region", "user can request for pick-up location"
        required:true,
        alias:"pickUp"
    }
},{
    collection:"company_service_detail"
});

class HelperClass{
    static findAllCompanyServiceDetail(session){
        return this.find({},{ session:session });
    }
    static findCompanyServiceDetailById(id, session){
        return this.find({ _id:id },{ session:session });
    }
    static updateCompanyServiceDetailById(id, updateData, session){
        return this.updateOne({ _id:id }, this.translateAliases( updateData ), { session:session });
    }
    static deleteCompanyServiceDetailById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    
    //new
    static findCompanyServiceDetailByRef(ref, id, session){
        switch(ref){
            case "company-id": return this.find({company_id:id},{ session:session });
            default: return this.find({},{ session:session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyServiceDetail = mongoose.model('CompanyServiceDetail',schema);