const mongoose = require('mongoose');
const _ = require("lodash");
const ApiError = require('../error/ApiError');
const {checkForWriteErrors} = require('../utilities/errorUtil');

const WasteDump = require('../models/customers/wasteDump');
const Track = require('../models/companies/geoObjectTrack')
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');

const {calWasteCondition, calCurrentAmtInKg}=require('../utilities/wasteUtil');

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
        try{
            this.transactionResults = await session.withTransaction(async()=>{
                
                const {customerId, companyId, geoObjectType, geoObjectId, amountUnit, amount} = wasteDumpData;
                

                if(geoObjectType == "track"){
                    const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("customerId", customerId, {}, session);
                    
                    //creating new customerUsedGeoObject
                    if(_.isEmpty(tempCustomerUsedGeoObject)){
                        console.log("new cugo \n");
                        this.wasteDump = new WasteDump(wasteDumpData);
                        this.result.wasteDump = await this.wasteDump.save({session});
                        
                        const newCustomerUsedGeoObject = {
                            customerId,
                            usedTrack:[{ companyId, trackId:geoObjectId }]
                        };
                        
                        this.customerUsedGeoObject = new CustomerUsedGeoObject(newCustomerUsedGeoObject);
                        this.result.customerUsedGeoObject = await this.customerUsedGeoObject.save({session});
                        
                    }else{
                        const {usedTrack} = tempCustomerUsedGeoObject[0];
                        const cugoId = tempCustomerUsedGeoObject[0]._id;
                        const isCompanyTrackInUse = _.filter(usedTrack, o => o.companyId == companyId);
                        
                        //first time using this company geoObject
                        if(_.isEmpty(isCompanyTrackInUse)){
                            console.log("first time using company geoObject cugo \n");
                            usedTrack.push({companyId, trackId:geoObjectId});
                            const result = await CustomerUsedGeoObject.updateById(cugoId, { usedTrack }, session);
                            checkForWriteErrors(result, "none", "New waste dump failed");
                            
                        //this company geoObject already in use
                        }else{
                            //making sure only one track of a company is used
                            if(isCompanyTrackInUse[0].trackId == geoObjectId){
                                const tempWasteDump = await WasteDump.findByRef("geoObjectId", geoObjectId, 
                                    {isCollected:1, amountUnit:1, amount:1}, session);
                                _.remove(tempWasteDump, o => o.isCollected == true);
    
                                //calculating current amount of waste in given track
                                tempWasteDump.forEach(wd => {
                                    currentAmount = calCurrentAmtInKg(currentAmount, wd.amountUnit, wd.amount);
                                });
                            }else{
                                throw ApiError.badRequest("Only one track of a company can be used");
                            }
                        }
                    }
                    currentAmount = calCurrentAmtInKg(currentAmount, amountUnit, amount);

                    //calculating waste condition for given track
                    const tempTrack = await Track.findById(geoObjectId, {wasteLimit:1}, session);
                    const {wasteLimit} = tempTrack[0];
                    let wasteCondition = calWasteCondition(currentAmount, wasteLimit);

                    //updating track waste condition
                    let result = await Track.updateById(geoObjectId, {wasteCondition}, session);
                    checkForWriteErrors(result, "none", "New waste dump failed");
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
        this.result = await WasteDump.findByRef(ref, id);
        return this.result;
    }

    async getWasteDumpById(id){
        this.result = await WasteDump.findById(id);
        return this.result;
    }

    async updateWasteDumpById(id, updateData){
        this.result = await WasteDump.updateById(id, updateData);
        return checkForWriteErrors(this.result, "status", "Waste dump update failed");
    }

    async deleteWasteDumpById(id, updateData){
        this.result = await WasteDump.deleteById(id);
        return checkForWriteErrors(this.result, "status", "Waste dump delete failed");

    }
}

exports.WasteDumpServices = WasteDumpServices;
