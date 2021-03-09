const mongoose = require('mongoose');
const _ = require('lodash');

const Subscription = require("../models/common/subscription");
const CustomerRequest = require('../models/common/customerRequest');
const Schedule = require('../models/customers/schedule');
const GeoObjectPoint = require('../models/companies/geoObjectPoint');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');

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
            await session.withTransaction(async()=> {
                const prevCustomerRequest = await CustomerRequest.findCustomerRequestById(id, {}, session);

                if(prevCustomerRequest[0].requestStatus == "pending" && updateData.requestStatus == "denied"){
                    //delete the request send notification
                    this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
                
                }else if(prevCustomerRequest[0].requestStatus == "pending" && updateData.requestStatus == "confirmed"){
                    const companyId = prevCustomerRequest[0].companyId;
                    const customerId = prevCustomerRequest[0].customerId;
                    if(prevCustomerRequest[0].requestType == "subscription"){
                        
                        //create subscription
                        const newSubData = {companyId, customerId};
                        this.result.subscription = await Subscription.create([newSubData], {session});
                        
                        //customer used geo object
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("customerId", customerId, {}, session);
                        if(_.isEmpty(tempCustomerUsedGeoObject)){
                            const newCustomerUsedGeoObjectData = {
                                customerId,
                                usedPoint:[],
                                usedTrack:[{companyId, trackId:prevCustomerRequest[0].subscribedGeoObjectId}]
                            }
                            this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.create([newCustomerUsedGeoObjectData], {session});
                        }else{
                            const usedPoint = tempCustomerUsedGeoObject.usedPoint;
                            const CustomerUsedGeoObjectId = tempCustomerUsedGeoObject._id;
                            usedPoint.push({companyId, pointId:this.result.point.id});
                            this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(CustomerUsedGeoObjectId, {usedPoint}, session);
                        }
                        //delete customerRequest
                        this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
                    }else if(prevCustomerRequest[0].requestType == "subscription with location"){
                        const coordinates = prevCustomerRequest[0].requestCoordinate;
                        const pointName = prevCustomerRequest[0].pointName;
                        const pointDescription = prevCustomerRequest[0].pointDescription;
                        
                        //create subscription
                        const newSubData = {companyId, customerId};
                        this.result.subscription = await Subscription.create([newSubData], {session});
                        
                        //create new point
                        const newPointData = {
                            companyId, 
                            pointName, 
                            coordinates, wasteCondition:"none", 
                            description:pointDescription
                        };
                        this.result.point = await GeoObjectPoint.create([newPointData], session);
                        //test
                        console.log(this.result.point._id);
                        
                        //customer used geo object
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("customerId", customerId, {}, session);
                        if(_.isEmpty(tempCustomerUsedGeoObject)){
                            const newCustomerUsedGeoObjectData = {
                                customerId,
                                usedPoint:[{companyId, pointId:this.result.point._id}],
                                usedTrack:[]
                            }
                            this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.create([newCustomerUsedGeoObjectData], {session});
                        }else{
                            const usedPoint = tempCustomerUsedGeoObject.usedPoint;
                            const CustomerUsedGeoObjectId = tempCustomerUsedGeoObject._id;
                            usedPoint.push({companyId, pointId:this.result.point._id});
                            this.result.CustomerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(CustomerUsedGeoObjectId, {usedPoint}, session);
                        }
                        //delete customerRequest
                        this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
                    }else if(prevCustomerRequest[0].requestType == "one time"){
                        //send notification to driver
                        const newSchedule = {
                            customerId,
                            customerRequestId:id
                        };
                        this.result.schedule = await Schedule.create([newSchedule], {session});
                        this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, { requestStatus:"confirmed" }, session);
                    
                    }
                    
                }else if(prevCustomerRequest[0].requestStatus == "confirmed" && updateData.requestStatus == "finished"){
                    this.result.schedule = await Schedule.deleteScheduleByRef("customerRequestId", id, session);
                    this.result.customerRequest = await CustomerRequest.updateCustomerRequestById(id, { requestStatus:"finished" }, session);
                }
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async deleteCustomerRequestById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = {};

                this.result.customerRequest = await CustomerRequest.deleteCustomerRequestById(id, session);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.CustomerRequestServices = CustomerRequestServices;
