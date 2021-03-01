const mongoose = require('mongoose');

const CustomerRequest = require('../models/common/customerRequest');
const Schedule = require('../models/customers/schedule');

class CustomerRequestServices{

    constructor(){
        this.customerRequest = undefined;
        this.result = undefined;
    }
    
    async createNewCustomerRequest(customerRequestData){
        this.customerRequest = new CustomerRequest(customerRequestData);
        this.result = await this.customerRequest.save();
        return this.result;
    }

    async getAllCustomerRequest(role, id, idArray){
        this.result = await CustomerRequest.findAllCustomerRequest(role, id, idArray);
        return this.result;
    }

    async getCustomerRequestById(id){
        this.result = await CustomerRequest.findCustomerRequestById(id);
        return this.result;
    }
    //new
    async getCustomerRequestByRef(ref, id){
        this.result = await CustomerRequest.findCustomerRequestByRef(ref, id);
        return this.result;
    }

    async updateCustomerRequestById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async()=> {
                const prevCustomerRequest = await CustomerRequest.findCustomerRequestById(id, session);

                if(prevCustomerRequest.work_status == "unconfirmed"){
                    this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, updateData, session);
                    //notify staff_id and staff_group_id after deleting work
                
                }else if(prevCustomerRequest.work_status == "confirmed" && updateData.work_status == "on progress"){
                    const newSchedule = {
                        customer_id:prevCustomerRequest.customer_id,
                        customer_request_id:id
                    };
                    this.result.schedule = await Schedule.create([newSchedule], {session});
                    this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, { work_status:"on progress" }, session);
                    
                }else if(prevCustomerRequest.work_status == "on progress" && updateData.work_status == "finished"){
                    this.result.schedule = await Schedule.deleteScheduleByRef("customer-request-id", id, session);
                    this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, { work_status:"finished" }, session);
                }
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async deleteCustomerRequestById(id, updateData){//delete ref also
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = {};
                
                //deleting customer_request ref from schedule
                this.result.schedule = await Schedule.deleteScheduleByRef("customer-request-id", id, session);
                
                this.result.customerRequest = await CustomerRequest.deleteWorkById(id, session);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.CustomerRequestServices = CustomerRequestServices;
