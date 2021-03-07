const _ = require('lodash');
const mongoose  = require('mongoose');
const ApiError = require('../error/ApiError');

const CustomerLogin = require('../models/customers/customerLogin');
const CustomerDetail = require('../models/customers/customerDetail');
const CustomerRequest = require('../models/common/customerRequest');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');
const Subscription = require('../models/common/subscription');
const Schedule = require('../models/customers/schedule');
const Notification = require('../models/common/notification');

class CustomerServices{

    constructor(){
        this.customerDetail = undefined;
        this.result = undefined;
    }
    
    async newCustomerInfo(customerDetail){
        this.customerDetail = new CustomerDetail(customerDetail);
        this.result = await this.customerDetail.save();
        return this.result;
    }

    async getAllCustomerInIdArray(customerInfoType, idArray){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.findAllCustomerInIdArray(idArray);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findAllCustomerDetailInIdArray(idArray);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }
    async getCustomerById(customerInfoType, id){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.findCustomerById(id);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findCustomerDetailById(id);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }
    async updateCustomerById(customerInfoType, id, updateData){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.updateCustomerById(id, updateData);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.updateCustomerDetailById(id, updateData);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }

    //delete the customer and its information and references
    async deleteCustomerById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = { wasteDump:{ update:[], delete:[] } };
                //should delete references to customerLogin and customerDetail from other collections too
                const tempWasteDump = await WasteDump.findWasteDumpByRef("customerId", id, session);
                const archiveWasteDump = _.remove(tempWasteDump, o => o.isCollected == true);
                archiveWasteDump.forEach(async wd => {
                    const  result = await WasteDump.updateWasteDumpById( wd._id, { customerId:"" }, session );
                    this.result.wasteDump.update.push(result);
                });
                tempWasteDump.forEach(async wd => {
                    const result = await WasteDump.deleteWasteDumpById( wd._id, session );
                    this.result.wasteDump.delete.push(result);
                });

                this.result.customerRequest = await CustomerRequest.deleteCustomerRequestByRef("customerId", id, session);
                this.result.notification = await Notification.deleteNotificationByRole("customer", id, session);
                this.result.subscription = await Subscription.deleteSubscriptionByRef("customerId", id, session);
                
                this.result.schedule = await Schedule.deleteScheduleByRef("customerId", id, session);
                this.result.customerUsedGeoObject = await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectByRef("customerId", id, session);
                this.result.customerLogin = await CustomerLogin.deleteCustomerById(id, session);
                this.result.customerDetail = await CustomerDetail.deleteCustomerDetailById(id, session);

            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.CustomerServices = CustomerServices;
