const mongoose = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');

const Subscription = require("../models/common/subscription");
const CustomerRequest = require('../models/common/customerRequest');
const Schedule = require('../models/customers/schedule');
const StaffGroup = require('../models/staff/staffGroup');
const Vehicle = require('../models/companies/vehicle');

class CustomerRequestServices{

    constructor(){
        this.customerRequest = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewCustomerRequest(customerRequestData){
        this.customerRequest = new CustomerRequest(customerRequestData);
        this.result = await this.customerRequest.save();
        return this.result;
    }

    async getAllCustomerRequest(role, id){
        this.result = await CustomerRequest.findAllCustomerRequest(role, id);
        return this.result;
    }

    async getCustomerRequestById(id){
        this.result = await CustomerRequest.findCustomerRequestById(id);
        return this.result;
    }

    async updateCustomerRequestById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async()=> {
                const prevCustomerRequest = await CustomerRequest.findCustomerRequestById(id, {}, session);
                const { companyId, customerId, requestStatus, requestType, subscribedGeoObjectType, subscribedGeoObjectId, coordinates} = prevCustomerRequest[0];

                if(requestStatus == "pending" && updateData.requestStatus == "denied"){
                    //delete the request send notification
                    this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
                
                }else if(requestStatus == "pending" && updateData.requestStatus == "accepted"){

                    if(requestType == "subscription" || requestType == "subscription with location"){
                        
                        //create subscription
                        const newSubData = {companyId, customerId};
                        this.result.subscription = await Subscription.create([newSubData], {session});
                        
                        //delete customerRequest
                        this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);

                    }else if(requestType == "one time"){
                        this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, { requestStatus:"accepted" }, session);
                    }
                    
                }else if(requestStatus == "accepted" && updateData.requestStatus == "assigned"){
                    const {staffGroupId, vehicleId} = updateData;

                    if(!_.isEmpty(staffGroupId) && !_.isEmpty(vehicleId)){
                        
                        const tempStaffGroup = await StaffGroup.findStaffGroupById(staffGroupId, {isReserved:1}, session);
                        const tempVehicle = await Vehicle.findVehicleById(vehicleId, {isReserved:1}, session);
                        
                        if(tempStaffGroup[0].isReserved){
                            throw ApiError.badRequest("staff group is reserved.");
                        }
                        
                        if(tempVehicle[0].isReserved){
                            throw ApiError.badRequest("vehicle is reserved.");
                        }
                        
                        this.result.staffGroup = await StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:true}, session);
                        this.result.vehicle = await Vehicle.updateVehicleById(vehicleId, {isReserved:true}, session);
                        
                        const newSchedule = {
                            customerId,
                            customerRequestId:id
                        };
                        
                        this.result.schedule = await Schedule.create([newSchedule], {session});
                        this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, updateData, session);
                        
                        //send notification to driver

                    }else{
                        throw ApiError.badRequest("staff group or vehicle not assigned for one-time task.");
                    }
                }
                else if(requestStatus == "assigned" && updateData.requestStatus == "finished"){
                    const {staffGroupId} = updateData;
                    //delete schedule
                    this.result.schedule = await Schedule.deleteScheduleByRef("customerRequestId", id, session);
                    //free staffGroup
                    this.result.staffGroup = await StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:false}, session);
                    //delete customerRequest
                    this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
                }
            });

            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("Customer request update transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Customer request update transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
    
    async deleteCustomerRequestById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                const tempCustomerRequestId = await CustomerRequest.findCustomerRequestById(id, {}, session);
                const {requestStatus, requestType, customerId, companyId, staffGroupId} = tempCustomerRequestId[0];

                if(requestStatus == "accepted"){
                    if(requestType == "subscription" || requestType == "subscription with location"){
                        //delete subscription
                        const tempSubscription = await Subscription.findAllSubscription(customerId, {}, session);
                        const deleteSubscription = _.remove(tempSubscription, s => s.companyId == companyId);
                        await Subscription.deleteSubscriptionById(deleteSubscription[0]._id, session);
                    }
                }else if(requestStatus == "assigned"){
                    //delete schedule
                    await Schedule.deleteScheduleByRef("customerRequestId", id, session);
                    //free staffGroup
                    await StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:false}, session);
                }
                //delete customerRequest
                await CustomerRequest.deleteCustomerRequestById(id, session);
            });
            
            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Customer request delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Customer request delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.CustomerRequestServices = CustomerRequestServices;
