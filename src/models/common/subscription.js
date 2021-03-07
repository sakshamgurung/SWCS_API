const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApiError = require('../../error/ApiError');

const schema = new Schema({
    companyId:{
        type:String,
        required:true,
    },
    customerId:{
        type:String,
        required:true,
    }
},{
    collection:"subscriptions"
});

class HelperClass{
    //for company
    static findAllSubscriber(companyId, session){
        return this.find({ companyId:companyId },{ session:session });
    }
    //for customer
    static findAllSubscription(customerId, session){
        return this.find({ customerId:customerId },{ session:session });
    }
    //for customer
    static deleteSubscriptionById(id, session){
        return this.deleteOne({ _id:id }, { session:session });
    }

    static deleteSubscriptionByRef(ref, id, session){
        switch(ref){
            case "customerId": return this.deleteMany({ customerId:id }, { session:session });
            case "companyId": return this.deleteMany({companyId:id}, { session:session });
            default: throw ApiError.badRequest("ref not defined");
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Subscription = mongoose.model('Subscription',schema);