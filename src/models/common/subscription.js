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
    static findAllSubscriber(companyId, projection, session){
        if(session == undefined){
            return this.find({ companyId }, projection);
        }else{
            return this.find({ companyId }, projection,{ session });
        }
    }

    //for customer
    static findAllSubscription(customerId, projection, session){
        if(session == undefined){
            return this.find({ customerId }, projection);
        }else{
            return this.find({ customerId }, projection,{ session });
        }
    }
    
    //for customer
    static deleteById(id, session){
        if(session == undefined){
            return this.deleteOne({ _id:id });
        }else{
            return this.deleteOne({ _id:id }, { session });
        }
    }

    static deleteByRef(ref, id, session){
        if(session == undefined){
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id });
                case "companyId": return this.deleteMany({companyId:id});
                default: throw ApiError.badRequest("ref not defined");
            }
        }else{
            switch(ref){
                case "customerId": return this.deleteMany({ customerId:id }, { session });
                case "companyId": return this.deleteMany({companyId:id}, { session });
                default: throw ApiError.badRequest("ref not defined");
            }
        }
    }
}

schema.loadClass(HelperClass);

module.exports = Subscription = mongoose.model('Subscription',schema);