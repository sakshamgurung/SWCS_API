const _ = require('lodash');
const mongoose  = require('mongoose');

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
        this.customerLogin = undefined; 
        this.customerDetail = undefined;
        this.result = undefined;
    }
    
    async createNewCustomer({customerLoginData, customerDetailData}){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {};
                this.customerLogin = new CustomerLogin(customerLoginData);
                this.result.customerLogin = await this.customerLogin.save({session:session});

                this.customerDetail = new CustomerDetail(customerDetailData);
                this.result.customerDetail = await this.customerDetail.save({session:session});

            });
            
        }finally{
            session.endSession();
        }
        return this.result;
    }

    //customer_login
    async getAllCustomerInIdArray(idArray){
        this.result = await CustomerLogin.findAllCustomerInIdArray(idArray);
        return this.result;
    }
    async getCustomerById(id){
        this.result = await CustomerLogin.findCustomerById(id);
        return this.result;
    }
    //new
    async getCustomerByUUID(uuidArray){
        this.result = await CustomerLogin.findCustomerByUUID(uuidArray);
        return this.result;
    }
    //new
    async getCustomerByToken(token){
        this.result = await CustomerLogin.findCustomerByToken(token);
        return this.result;
    }
    //new
    async getCustomerByRefreshToken(refreshToken){
        this.result = await CustomerLogin.findCustomerByRefreshToken(refreshToken);
        return this.result;
    }
    //new
    async getCustomerByTimeStamp(timeStamp){
        this.result = await CustomerLogin.findCustomerByTimeStamp(timeStamp);
        return this.result;
    }
    async updateCustomerById(id, updateData){
        this.result = await CustomerLogin.updateCustomerById(id, updateData);
        return this.result;
    }

    //customer_detail
    async getAllCustomerDetailInIdArray(idArray){
        this.result = await CustomerDetail.findAllCustomerDetailInIdArray(idArray);
        return this.result;
    }
    async getCustomerDetailById(id){
        this.result = await CustomerDetail.findCustomerDetailById(id);
        return this.result;
    }    
    //new
    async getCustomerDetailByRef(ref, id){
        this.result = await CustomerDetail.findCustomerDetailByRef(ref, id);
        return this.result;
    }
    async updateCustomerDetailById(id, updateData){
        this.result = await CustomerDetail.updateCustomerDetailById(id, updateData);
        return this.result;
    }

    //delete the customer and its information and references
    async deleteCustomerById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = { wasteDump:{ update:[], delete:[] } };
                //should delete references to customerLogin and customerDetail from other collections too
                const tempWasteDump = await WasteDump.findWasteDumpByRef("customer-id", id, session);
                const archiveWasteDump = _.remove(tempWasteDump, (o) => { o.is_collected == true; });
                archiveWasteDump.forEach(wd => {
                    const  result = await WasteDump.updateWasteDumpById( wd._id, { customerId:"" }, session );
                    this.result.wasteDump.update.push(result);
                });
                tempWasteDump.forEach(wd => {
                    const result = await WasteDump.deleteWasteDumpById( wd._id, session );
                    this.result.wasteDump.delete.push(result);
                });

                this.result.customerRequest = await CustomerRequest.deleteCustomerRequestByRef("customer-id", id, session);
                this.result.notification = await Notification.deleteNotificationByRole("customer", id, session);
                this.result.subscription = await Subscription.deleteSubscriptionByRef("customer-id", id, session);
                
                this.result.schedule = await Schedule.deleteScheduleByRef("customer-id", id, session);
                this.result.customerUsedGeoObject = await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectByRef("customer-id", id, session);
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
