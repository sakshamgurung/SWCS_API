const _ = require('lodash');
const mongoose = require('mongoose');

const ApiError = require('../error/ApiError');
const WasteCatalog = require('../models/common/wasteCatalog');
const WasteList = require('../models/companies/wasteList');

class WasteCatalogServices{

    constructor(){
        this.wasteCatalog = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewWasteCatalog(wasteCatalogData){
        this.wasteCatalog = new WasteCatalog(wasteCatalogData);
        this.result = await this.wasteCatalog.save();
        return this.result;
    }

    async getAllWasteCatalog(){
        this.result = await WasteCatalog.findAllWasteCatalog({description:0});
        return this.result;
    }

    async getWasteCatalogById(id){
        this.result = await WasteCatalog.findWasteCatalogById(id);
        return this.result;
    }

    async updateWasteCatalogById(id, updateData){
        this.result = await WasteCatalog.updateWasteCatalogById(id, updateData);
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Waste catalog update failed");
        }
    }

    async deleteWasteCatalogById(id, updateData){
        const { wasteList } = updateData;
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                const tempWasteList = await WasteList.findWasteListByRef("wasteCatalogId", id, {}, session);
                
                if(wasteList.remapping){
                    //remapping
                    const{ newWasteCatalogId } = wasteList;
                    tempWasteList.forEach(async wl => {
                        await WasteList.updateWasteListById( wl._id, { wasteCatalogId: newWasteCatalogId }, session );
                    });
                }else{
                    throw ApiError.badRequest("remapping is needed");
                }
                
                await WasteCatalog.deleteWasteCatalogById(id);
            });
            
            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Waste catalog delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Waste catalog delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WasteCatalogServices = WasteCatalogServices;
