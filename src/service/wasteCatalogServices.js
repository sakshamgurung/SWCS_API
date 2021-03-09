const _ = require('lodash');
const mongoose = require('mongoose');

const ApiError = require('../error/ApiError');
const WasteCatalog = require('../models/common/wasteCatalog');
const WasteList = require('../models/companies/wasteList');

class WasteCatalogServices{

    constructor(){
        this.wasteCatalog = undefined;
        this.result = undefined;
    }
    
    async createNewWasteCatalog(wasteCatalogData){
        this.wasteCatalog = new WasteCatalog(wasteCatalogData);
        this.result = await this.wasteCatalog.save();
        return this.result;
    }

    async getAllWasteCatalog(){
        this.result = await WasteCatalog.findAllWasteCatalog();
        return this.result;
    }

    async getWasteCatalogById(id){
        this.result = await WasteCatalog.findWasteCatalogById(id);
        return this.result;
    }

    async updateWasteCatalogById(id, updateData){
        this.result = await WasteCatalog.updateWasteCatalogById(id, updateData);
        return this.result;
    }

    async deleteWasteCatalogById(id, updateData){
        const { wasteList } = updateData;
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = { wasteList:[] };
                const tempWasteList = await WasteList.findWasteListByRef("wasteCatalogId", id, {}, session);
                
                if(wasteList.remapping){
                    //remapping
                    const{ newWasteCatalogId } = wasteList;
                    tempWasteList.forEach(async wl => {
                        const result = await WasteList.updateWasteListById( wl._id, { wasteCatalogId: newWasteCatalogId }, session );
                        this.result.wasteList.push(result);
                    });
                }else{
                    throw ApiError.badRequest("remapping is needed");
                }
                
                this.result.wasteCatalog = await WasteCatalog.deleteWasteCatalogById(id);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.WasteCatalogServices = WasteCatalogServices;
