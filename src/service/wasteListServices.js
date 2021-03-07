const mongoose = require('mongoose');
const _ = require('lodash');

const WasteList = require('../models/companies/wasteList');
const WasteDump = require('../models/customers/wasteDump');

class WasteListServices{

    constructor(){
        this.wasteList = undefined;
        this.result = undefined;
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
        return this.result;
    }

    async deleteWasteListById(id, updateData){
        const { wasteDump } = updateData;
        const session = await mongoose.startSession();
        try {
            session.withTransaction(async() => {
                this.result = { wasteDump:[] };

                const tempWasteDump = WasteDump.findWasteDumpByRef("wasteListId", id, session);
                _.remove(tempWasteDump, wd => wd.is_collected == true );
                
                if(wasteDump.remapping){
                    //remapping
                    const{ newWasteListId } = wasteDump;
                    tempWasteDump.forEach(async wd => {
                        const result = await WasteDump.updateWasteDumpById( wd._id, { wasteListId: newWasteListId }, session );
                        this.result.wasteDump.push(result);
                    });
                }else{
                    //removing
                    tempWasteDump.forEach(async wd => {
                        const result = await WasteDump.deleteWasteDumpById( wd._id, session );
                        this.result.wasteDump.push(result);
                    });
                }

                this.result.wasteList = await WasteList.deleteWasteListById(id);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.WasteListServices = WasteListServices;
