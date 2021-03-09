const mongoose  = require('mongoose');
const _ = require('lodash');

const Subscription = require('../models/common/subscription');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');
const Notification = require('../models/common/notification');
const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const GeoObjectPoint = require('../models/companies/geoObjectPoint');
const GeoObjectTrack = require('../models/companies/geoObjectTrack');


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
                const {customerId, companyId} = updateData;
                this.result = {wasteDump:[], notification:[]};
                const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("customerId", customerId, {}, session);
                
                if(!_.isEmpty(tempCustomerUsedGeoObject)){
                    const removeUsedPoint = _.remove(tempCustomerUsedGeoObject[0].usedPoint, o => o.companyId == companyId);
                    const updateUsedTrack = _.remove(tempCustomerUsedGeoObject[0].usedTrack, o => o.companyId == companyId);
                    const tempSchedule = await Schedule.findScheduleByRef("customerId", customerId, {}, session);
                    
                    if(!_.isEmpty(removeUsedPoint)){
                        const removeUsedPointId = removeUsedPoint[0].pointId;
                        const tempGeoObjectPoint = await GeoObjectPoint.findGeoObjectById(removeUsedPointId, {}, session);
                        const workId =  tempGeoObjectPoint[0].workId;
                        
                        //delete schedule
                        const removeSchedule = _.remove(tempSchedule, o => o.workId == workId);
                        if(!_.isEmpty(removeSchedule)){
                            this.result.schedule = await Schedule.deleteScheduleById(removeSchedule[0]._id, session);
                        }
                        
                        //update work => geoObjectPoint
                        const tempWork = await Work.findWorkById(workId);
                        _.remove(tempWork[0].geoObjectPointId, o => o == removeUsedPointId);
                        
                        const geoObjectPointIdUpdate = tempWork[0].geoObjectPointId;
                        this.result.work = await Work.updateWorkById(workId, {geoObjectPointId: geoObjectPointIdUpdate}, session);
                        
                        //checking if work is empty
                        if(_.isEmpty(tempWork[0].geoObjectPointId) && _.isEmpty(tempWork[0].geoObjectTrackId)){
                            //notify the company and ask to delete work
                        }

                        //delete geoObjectPoint
                        this.result.geoObjectPoint = await GeoObjectPoint.deleteGeoObjectById(removeUsedPointId, session);
                    }

                    //update geoObjectTrack
                    if(!_.isEmpty(updateUsedTrack)){
                        const updateUsedTrackId = updateUsedTrack[0].trackId;
                        const tempGeoObjectTrack = await GeoObjectTrack.findGeoObjectById(updateUsedTrackId, {}, session);
                        const workId =  tempGeoObjectTrack[0].workId;
                        
                        //delete schedule
                        const removeSchedule = _.remove(tempSchedule, o => o.workId == workId);
                        if(!_.isEmpty(removeSchedule)){
                            this.result.schedule = await Schedule.deleteScheduleById(removeSchedule[0]._id, session);
                        }
                        
                        //check if there is any schedule for work id
                        const allSchedule = await Schedule.findScheduleByRef("workId", workId, {}, session);
                        if(_.isEmpty(allSchedule)){
                            //update work => geoObjectTrack
                            const tempWork = await Work.findWorkById(workId);
                            _.remove(tempWork[0].geoObjectTrackId, o => o == updateUsedTrackId);
                            
                            const geoObjectPointIdUpdate = tempWork[0].geoObjectPointId;
                            this.result.work = await Work.updateWorkById(workId, {geoObjectPointId: geoObjectPointIdUpdate}, session);
                            
                            //checking if work is empty
                            if(_.isEmpty(tempWork[0].geoObjectPointId) && _.isEmpty(tempWork[0].geoObjectTrackId)){
                                this.result.geoObjectTrack = await GeoObjectTrack.updateGeoObjectById(updateUsedTrack, {workId:""}, session);
                                //notify the company and ask to delete work

                            }
                        }
                    }

                    const customerUsedGeoObjectId = tempCustomerUsedGeoObject[0]._id;
                    
                    //update customerUsedGeoObject
                    if(_.isEmpty(tempCustomerUsedGeoObject[0].usedPoint) && _.isEmpty(tempCustomerUsedGeoObject[0].usedTrack)){
                        this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectById(customerUsedGeoObjectId, session);
                    }else{
                        const usedPointUpdate = tempCustomerUsedGeoObject[0].usedPoint;
                        const usedTrackUpdate = tempCustomerUsedGeoObject[0].usedTrack;
                        const customerUsedGeoObjectUpdateData = {usedPoint:usedPointUpdate, usedTrack:usedTrackUpdate};
                        this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(customerUsedGeoObjectId, customerUsedGeoObjectUpdateData, session);
                    }
                }

                //delete isCollected==false wasteDump
                const tempWasteDump = await WasteDump.findWasteDumpByRef("customerId", customerId, {}, session);
                const removeWasteDump = _.remove(tempWasteDump, o => (o.companyId == companyId && o.isCollected == false));
                removeWasteDump.forEach(async wd => {
                    const result = await WasteDump.deleteWasteDumpById(wd._id, session);
                    this.result.wasteDump.push(result);
                });

                //delete notification from company
                const tempNotification = await Notification.findAllNotification("customer", customerId, {}, session);
                const removeNotification = _.remove(tempNotification, o => (o.from.role == "company" && o.from.id == companyId) );
                removeNotification.forEach(async n => {
                    const result = await Notification.deleteNotificationById(n._id, session);
                    this.result.notification.push(result);
                });

                this.result.subscription = await Subscription.deleteSubscriptionById(id, session);

            });
            
        } finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.SubscriptionServices = SubscriptionServices;
