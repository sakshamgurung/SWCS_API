const mongoose = require('mongoose');
const _ = require("lodash");
const ApiError = require('../error/ApiError');

const WasteDump = require('../models/customers/wasteDump');
const Track = require('../models/companies/geoObjectTrack')
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');

class WasteDumpServices{

    constructor(){
        this.wasteDump = undefined;
        this.customerUsedGeoObject = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewWasteDump(wasteDumpData){
        this.result = {};
        const session  = await mongoose.startSession();

        let currentAmount = 0;
        const wasteCondition = "none";
        try{
            this.transactionResults = await session.withTransaction(async()=>{
                
                const {customerId, companyId, geoObjectType, geoObjectId, amountUnit, amount} = wasteDumpData;
                

                if(geoObjectType == "track"){
                    const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("customerId", customerId, {}, session);
                    
                    //creating new customerUsedGeoObject
                    if(_.isEmpty(tempCustomerUsedGeoObject)){
                        this.wasteDump = new WasteDump(wasteDumpData);
                        this.result.wasteDump = await this.wasteDump.save({session});
                        
                        const newCustomerUsedGeoObject = {
                            customerId,
                            usedTrack:[{ companyId, trackId:geoObjectId }]
                        };

                        this.customerUsedGeoObject = new CustomerUsedGeoObject({newCustomerUsedGeoObject});
                        this.result.customerUsedGeoObject = await this.customerUsedGeoObject.save({session});
                        
                    }else{
                        const {usedTrack} = tempCustomerUsedGeoObject[0].usedTrack;
                        const customerUsedGeoObjectId = tempCustomerUsedGeoObject[0]._id;
                        const isCompanyTrackInUse = _.remove(usedTrack, o => o.companyId == companyId);

                        //first time using this company geoObject
                        if(_.isEmpty(isCompanyTrackInUse)){
                            usedTrack.push({companyId, trackId:geoObjectId});
                            this.result.customerUsedGeoObject = await this.customerUsedGeoObject.updateCustomerUsedGeoObjectById(customerUsedGeoObjectId, { usedTrack }, session);
                            
                        //this company geoObject already in use
                        }else{
                            //making sure only one track of a company is used
                            if(isCompanyTrackInUse[0].trackId == geoObjectId){
                                const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", geoObjectId, 
                                    {isCollected:1, amountUnit:1, amount:1}, session);
                                _.remove(tempWasteDump, o => o.isCollected == true);
    
                                //calculating current amount of waste in given track
                                tempWasteDump.forEach(wd => {
                                    if(wd.amountUnit == "kg" || wd.amountUnit == "litre"){
                                        currentAmount = currentAmount + wd.amount;
                                    }else if(wd.amountUnit == "bora"){
                                        currentAmount = currentAmount + ( wd.amount * 15);//conversion from bora to 15 kg
                                    }
                                });
                            }else{
                                ApiError.badRequest("Only one track of a company can be used");
                            }
                        }
                    }

                    if(amountUnit == "kg" || amountUnit == "litre"){
                        currentAmount = currentAmount + amount;
                    }else if(amountUnit == "bora"){
                        currentAmount = currentAmount + ( amount * 15);//conversion from bora to 15 kg
                    }

                    //calculating waste condition for given track
                    const tempTrack = await Track.findGeoObjectById(geoObjectId, {}, session);
                    const {wasteLimit} = tempTrack[0];
                    
                    if(_.inRange(currentAmount, 1, wasteLimit/3)){
                        wasteCondition = "low";
                    }else if(_.inRange(currentAmount, wasteLimit/3, (wasteLimit/3)*2 )){
                        wasteCondition = "medium";
                    }else if(currentAmount >= wasteLimit){
                        wasteCondition = "high";
                    }

                    //updating track waste condition
                    this.result.track = await Track.updateGeoObjectById(geoObjectId, {wasteCondition}, session);
                }

                this.wasteDump = new WasteDump(wasteDumpData);
                this.result.wasteDump = await this.wasteDump.save({session});
            });
                        
            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("New waste dump transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("New waste dump transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
        //send nontification to company if wasteCondition is high
    }

    async getAllWasteDump(ref, id){
        this.result = await WasteDump.findWasteDumpByRef(ref, id);
        return this.result;
    }

    async getWasteDumpById(id){
        this.result = await WasteDump.findWasteDumpById(id);
        return this.result;
    }

    async updateWasteDumpById(id, updateData){
        this.result = await WasteDump.updateWasteDumpById(id, updateData);
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Waste dump update failed");
        }
    }

    async deleteWasteDumpById(id, updateData){
        this.result = await WasteDump.deleteWasteDumpById(id);
        if(!this.result.hasOwnProperty("writeErrors")){
            return {statusCode:"200", status:"Success"}
        }else{
            throw ApiError.serverError("Waste dump delete failed");
        }

    }
}

exports.WasteDumpServices = WasteDumpServices;
