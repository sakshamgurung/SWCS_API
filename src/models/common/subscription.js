const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    company_id:{
        type:Schema.Types.ObjectId,
        required:true
    },
    customer_id:{
        type:Schema.Types.ObjectId,
        required:true
    }
},{
    collection:"subscription"
});

class HelperClass{
    //for company
    static findAllSubscriber(companyId, session){
        return this.find({ company_id:companyId },{ session:session });
    }
    //for customer
    static findAllSubscription(customerId, session){
        return this.find({ customer_id:customerId },{ session:session });
    }
    //for customer
    static deleteSubscriptionById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }
    //new
    static deleteSubscriptionByRef(ref, id, session){
        switch(ref){
            case "customer-id": return this.deleteMany({ customer_id:id }, { session:session });
            case "company-id": return this.deleteMany({company_id:id}, { session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Subscription = mongoose.model('Subscription',schema);