const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    // pickUp:{
    //     type:[String],//"door to door, "pre-definded location and region"
    //     required:true,
    // }
},{
    collection:"companyServiceDetails"
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
    static findCompanyServiceDetailByRef(ref, id, session){
        switch(ref){
            case "companyId": return this.find({companyId:id},{ session:session });
            default: return this.find({},{ session:session });
        }
    }
}

schema.loadClass(HelperClass);

module.exports = CompanyServiceDetail = mongoose.model('CompanyServiceDetail',schema);