const _ = require('lodash');
const mongoose  = require('mongoose');
const ApiError = require('../error/ApiError');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

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
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                this.result = {};
                const {customerId} = customerDetail;
                
                this.customerDetail = new CustomerDetail(customerDetail);
                this.result.customerDetail = await this.customerDetail.save({session});
                
                let result = await CustomerLogin.findByIdAndUpdate(customerId, {firstTimeLogin:false}, {session});
                checkForWriteErrors(result, "none", "New company info failed");
            });
            
            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("New customer info transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("New customer info transaction failed");
        }finally{
            session.endSession();
        }
    }

    async getAllCustomerInIdArray(customerInfoType, idArray, query){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.findAllInIdArray(idArray, query);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findAllInIdArray(idArray, query);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }

    async getCustomerById(customerInfoType, id){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.findById(id);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findById(id);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }
    
    async getCustomerByRef(customerInfoType, ref, id, query){
        if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findByRef(ref, id, query);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return this.result;
    }

    async updateCustomerById(customerInfoType, id, updateData){
        if(customerInfoType == "customer"){
            this.result = await CustomerLogin.findByIdAndUpdate(id, updateData);
        }else if(customerInfoType == "customer-detail"){
            this.result = await CustomerDetail.findByIdAndUpdate(id, updateData);
        }else{
            throw ApiError.badRequest("customerInfoType not found!!!");
        }
        return checkForWriteErrors(this.result, "status", "Customer update failed");
    }
    
    //delete the customer and its information and references
    async deleteCustomerById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {
                //should delete references to customerLogin and customerDetail from other collections too
                const tempWasteDump = await WasteDump.findByRef("customerId", id, {}, {}, session);
                const archiveWasteDump = _.remove(tempWasteDump, o => o.isCollected == true);
                for(let wd of archiveWasteDump ){
                    this.result = await WasteDump.findByIdAndUpdate( wd._id, { customerId:"" }, {session} );
                    checkForWriteErrors(this.result, "none", "Customer delete failed");    
                }
                for(let wd of tempWasteDump ){
                    this.result = await WasteDump.findByIdAndDelete( wd._id, {session} );
                    checkForWriteErrors(this.result, "none", "Customer delete failed");
                }
                
                this.result = await CustomerRequest.deleteByRef("customerId", id, session);
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                this.result = await Notification.deleteByRole("customer", id, {}, session);
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                this.result = await Subscription.deleteByRef("customerId", id, session);
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                
                this.result = await Schedule.deleteByRef("customerId", id, session);
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                this.result = await CustomerUsedGeoObject.deleteByRef("customerId", id, session);
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                this.result = await CustomerLogin.findByIdAndDelete(id, {session});
                checkForWriteErrors(this.result, "none", "Customer delete failed");
                this.result = await CustomerDetail.findByIdAndDelete(id, {session});
                checkForWriteErrors(this.result, "none", "Customer delete failed");
            });

            return checkTransactionResults(this.transactionResults, "status", "Customer delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Customer delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.CustomerServices = CustomerServices;
