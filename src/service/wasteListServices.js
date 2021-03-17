const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const _ = require('lodash');

const WasteList = require('../models/companies/wasteList');
const WasteDump = require('../models/customers/wasteDump');

class WasteListServices{

    constructor(){
        this.wasteList = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewWasteList(wasteListData){
        this.wasteList = new WasteList(wasteListData);
        this.result = await this.wasteList.save();
        return this.result;
    }

    async getAllWasteList(companyId){
        this.result = await WasteList.findAllWasteList(companyId);
        return this.result;
    }

    async getWasteListById(id){
        this.result = await WasteList.findWasteListById(id);
        return this.result;
    }

    async updateWasteListById(id, updateData){
        this.result = await WasteList.updateWasteListById(id, updateData);
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Waste list update failed");
        }
    }

    async deleteWasteListById(id, updateData){
        const { wasteDump } = updateData;
        const session = await mongoose.startSession();
        try {
            this.transactionResults = session.withTransaction(async() => {
                const tempWasteDump = WasteDump.findWasteDumpByRef("wasteListId", id, {}, session);
                _.remove(tempWasteDump, wd => wd.is_collected == true );
                
                if(wasteDump.remapping){
                    //remapping
                    const{ newWasteListId } = wasteDump;
                    tempWasteDump.forEach(async wd => {
                        await WasteDump.updateWasteDumpById( wd._id, { wasteListId: newWasteListId }, session );
                    });
                }else{
                    //removing
                    tempWasteDump.forEach(async wd => {
                        await WasteDump.deleteWasteDumpById( wd._id, session );
                    });
                }

                await WasteList.deleteWasteListById(id);
            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Waste list delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Waste list delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WasteListServices = WasteListServices;
