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
        this.transactionResults = undefined;
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
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Customer update failed");
        }
    }

    //delete the customer and its information and references
    async deleteCustomerById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {
                //should delete references to customerLogin and customerDetail from other collections too
                const tempWasteDump = await WasteDump.findWasteDumpByRef("customerId", id, {}, session);
                const archiveWasteDump = _.remove(tempWasteDump, o => o.isCollected == true);
                archiveWasteDump.forEach(async wd => {
                    await WasteDump.updateWasteDumpById( wd._id, { customerId:"" }, session );
                });
                tempWasteDump.forEach(async wd => {
                    await WasteDump.deleteWasteDumpById( wd._id, session );
                });

                await CustomerRequest.deleteCustomerRequestByRef("customerId", id, session);
                await Notification.deleteNotificationByRole("customer", id, session);
                await Subscription.deleteSubscriptionByRef("customerId", id, session);
                
                await Schedule.deleteScheduleByRef("customerId", id, session);
                await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectByRef("customerId", id, session);
                await CustomerLogin.deleteCustomerById(id, session);
                await CustomerDetail.deleteCustomerDetailById(id, session);
            });
            
            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Customer delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Customer delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.CustomerServices = CustomerServices;
