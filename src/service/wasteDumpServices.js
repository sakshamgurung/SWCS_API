const mongoose = require('mongoose');
const _ = require("lodash");

const WasteDump = require('../models/customers/wasteDump');
const Point = require('../models/companies/geoObjectPoint')
const Track = require('../models/companies/geoObjectTrack')

class WasteDumpServices{

    constructor(){
        this.wasteDump = undefined;
        this.result = undefined;
    }
    
    async createNewWasteDump(wasteDumpData){
        this.result = {};
        const session  = await mongoose.startSession();

        let currentAmount = 0;
        const wasteCondition = "none";
        try{
            await session.withTransaction(async()=>{
                const {geoObjectType, geoObjectId, amountUnit, amount} = wasteDumpData;

                const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", geoObjectId, session);
                _.remove(tempWasteDump, o => o.isCollected == true);

                tempWasteDump.forEach(wd => {
                    if(wd.amountUnit == "kg" || wd.amountUnit == "litre"){
                        currentAmount = currentAmount + wd.amount;
                    }else if(wd.amountUnit == "bora"){
                        currentAmount = currentAmount + ( wd.amount * 15);//conversion from bora to 15 kg
                    }
                });
                
                if(amountUnit == "kg" || amountUnit == "litre"){
                    currentAmount = currentAmount + amount;
                }else if(amountUnit == "bora"){
                    currentAmount = currentAmount + ( amount * 15);//conversion from bora to 15 kg
                }

                if(geoObjectType == "track"){
                    const tempTrack = await Track.findGeoObjectById(geoObjectId, session);
                    const {wasteLimit} = tempTrack[0];
                    if(0<currentAmount && currentAmount<=(wasteLimit/3)){
                        wasteCondition = "low";
                    }else if((wasteLimit/3)<currentAmount && currentAmount<=((wasteLimit/3)*2)){
                        wasteCondition = "medium";
                    }
                    if(currentAmount>=wasteLimit){
                        wasteCondition = "high";
                    }
                    this.result.track = await Track.updateGeoObjectById(geoObjectId, {wasteCondition:wasteCondition}, session);

                }else if(geoObjectType == "point"){
                    const tempPoint = await Point.findGeoObjectById(geoObjectId, session);
                    const {wasteLimit} = tempPoint[0];
                    if(0<currentAmount && currentAmount<=(wasteLimit/3)){
                        wasteCondition = "low";
                    }else if((wasteLimit/3)<currentAmount && currentAmount<=((wasteLimit/3)*2)){
                        wasteCondition = "medium";
                    }
                    if(currentAmount>=wasteLimit){
                        wasteCondition = "high";
                    }
                    this.result.point = await Point.updateGeoObjectById(geoObjectId, {wasteCondition:wasteCondition}, session);
                }

                this.wasteDump = new WasteDump(wasteDumpData);
                this.result.wasteDump = await this.wasteDump.save({session:session});
            });
        }finally{
            session.endSession();
        }
        //send nontification to company if wasteCondition is high
        return this.result;
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
        return this.result;
    }

    async deleteWasteDumpById(id, updateData){
        this.result = await WasteDump.deleteWasteDumpById(id);
        return this.result;
    }
}

exports.WasteDumpServices = WasteDumpServices;
