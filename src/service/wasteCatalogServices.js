const _ = require('lodash');
const mongoose = require('mongoose');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

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
        this.result = await WasteCatalog.findAll({description:0});
        return this.result;
    }

    async getWasteCatalogById(id){
        this.result = await WasteCatalog.findById(id);
        return this.result;
    }

    async updateWasteCatalogById(id, updateData){
        this.result = await WasteCatalog.updateById(id, updateData);
        return checkForWriteErrors(this.result, "status", "Waste catalog update failed");
    }
    
    async deleteWasteCatalogById(id, updateData){
        const { wasteList } = updateData;
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                const tempWasteList = await WasteList.findByRef("wasteCatalogId", id, {}, session);
                
                if(wasteList.remapping){
                    //remapping
                    const{ newWasteCatalogId } = wasteList;
                    for(let wl of tempWasteList ){
                        this.result = await WasteList.updateById( wl._id, { wasteCatalogId: newWasteCatalogId }, session );
                        checkForWriteErrors(this.result, "none", "Waste catalog delete failed");
                    }
                }else{
                    throw ApiError.badRequest("remapping is needed");
                }
                
                this.result = await WasteCatalog.deleteById(id);
                checkForWriteErrors(this.result, "none", "Waste catalog delete failed");
            });

            return checkTransactionResults(this.transactionResults, "status", "Waste catalog delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Waste catalog delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WasteCatalogServices = WasteCatalogServices;
