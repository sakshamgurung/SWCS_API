const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const _ = require('lodash');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

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
        this.result = await WasteList.findAll(companyId);
        return this.result;
    }

    async getWasteListById(id){
        this.result = await WasteList.findById(id);
        return this.result;
    }

    async updateWasteListById(id, updateData){
        this.result = await WasteList.updateById(id, updateData);
        return checkForWriteErrors(this.result, "status", "Waste list update failed");       
    }
    
    async deleteWasteListById(id, updateData){
        const { wasteDump } = updateData;
        const session = await mongoose.startSession();
        try {
            this.transactionResults = session.withTransaction(async() => {
                const tempWasteDump = WasteDump.findByRef("wasteListId", id, {}, session);
                _.remove(tempWasteDump, wd => wd.is_collected == true );
                
                if(wasteDump.remapping){
                    //remapping
                    const{ newWasteListId } = wasteDump;
                    for(let wd of tempWasteDump ){
                        this.result = await WasteDump.updateById( wd._id, { wasteListId: newWasteListId }, session );
                        checkForWriteErrors(this.result, "none", "Waste list delete failed");       
                    }
                }else{
                    //removing
                    for(let wd of tempWasteDump ){
                        this.result = await WasteDump.deleteById( wd._id, session );
                        checkForWriteErrors(this.result, "none", "Waste list delete failed");       
                    }
                }
                
                this.result = await WasteList.deleteById(id);
                checkForWriteErrors(this.result, "none", "Waste list delete failed");       
            });

            return checkTransactionResults(this.transactionResults, "status", "Waste list delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Waste list delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WasteListServices = WasteListServices;
