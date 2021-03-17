const mongoose  = require('mongoose');
const ApiError = require('../error/ApiError');
const _ = require('lodash');

const Subscription = require('../models/common/subscription');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');
const Notification = require('../models/common/notification');
const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const Track = require('../models/companies/geoObjectTrack');


class SubscriptionServices{

    constructor(){
        this.subscription = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
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
            this.transactionResults = await session.withTransaction(async() => {
                const {customerId, companyId} = updateData;

                const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("customerId", 
                    customerId, {}, session);
                
                if(!_.isEmpty(tempCustomerUsedGeoObject)){
                    const updateUsedTrack = _.remove(tempCustomerUsedGeoObject[0].usedTrack, o => o.companyId == companyId);
                    
                    //update geoObjectTrack
                    if(!_.isEmpty(updateUsedTrack)){
                        const updateUsedTrackId = updateUsedTrack[0].trackId;
                        const tempTrack = await Track.findGeoObjectById(updateUsedTrackId, {}, session);
                        const workId =  tempTrack[0].workId;
                        
                        //delete schedule
                        const tempSchedule = await Schedule.findScheduleByRef("customerId", customerId, {}, session);
                        const removeSchedule = _.remove(tempSchedule, o => o.workId == workId);
                        if(!_.isEmpty(removeSchedule)){
                            await Schedule.deleteScheduleById(removeSchedule[0]._id, session);
                        }
                        
                        //check if there is any schedule for work id
                        const allSchedule = await Schedule.findScheduleByRef("workId", workId, {_id:1}, session);
                        if(_.isEmpty(allSchedule)){
                            //notifiy no schedule of given work and check track
                        }
                    }

                    const customerUsedGeoObjectId = tempCustomerUsedGeoObject[0]._id;
                    
                    //update customerUsedGeoObject
                    if(_.isEmpty(tempCustomerUsedGeoObject[0].usedTrack)){
                        await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectById(customerUsedGeoObjectId, session);
                    }else{
                        const {usedTrack} = tempCustomerUsedGeoObject[0].usedTrack;
                        await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(customerUsedGeoObjectId, {usedTrack}, session);
                    }
                }

                //delete isCollected==false wasteDump
                const tempWasteDump = await WasteDump.findWasteDumpByRef("customerId", customerId, {companyId:1, isCollected:1}, session);
                const removeWasteDump = _.remove(tempWasteDump, o => (o.companyId == companyId && o.isCollected == false));
                removeWasteDump.forEach(async wd => {
                    await WasteDump.deleteWasteDumpById(wd._id, session);
                });

                //delete notification from company
                const tempNotification = await Notification.findAllNotification("customer", customerId, {from:1}, session);
                const removeNotification = _.remove(tempNotification, o => (o.from.role == "company" && o.from.id == companyId) );
                removeNotification.forEach(async n => {
                    await Notification.deleteNotificationById(n._id, session);
                });

                await Subscription.deleteSubscriptionById(id, session);

            });
            
            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Subscription delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Subscription delete transaction abort due to error: " + e.message);
        } finally{
            session.endSession();
        }
    }
}

exports.SubscriptionServices = SubscriptionServices;
