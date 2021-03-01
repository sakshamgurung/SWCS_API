const mongoose  = require('mongoose');

const Subscription = require('../models/common/subscription');


class SubscriptionServices{

    constructor(){
        this.subscription = undefined;
        this.result = undefined;
    }
    
    async createNewSubscription(subscriptionData){
        this.subscription = new Subscription(subscriptionData);
        this.result = await this.subscription.save();
        return this.result;
    }

    async getAllSubscriber(companyId){
        this.result = await Subscription.findAllSubscriber(companyId);
        return this.result;
    }
    async getAllSubscription(customerId){
        this.result = await Subscription.findAllSubscription(customerId);
        return this.result;
    }

    //delete the subscription and its information and references
    async deleteSubscriptionById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {};

                this.result.subscription = await Subscription.deleteSubscriptionById(id, session);

                //should delete references to company and customer relation from other collections too
            });
            
        } finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.SubscriptionServices = SubscriptionServices;
