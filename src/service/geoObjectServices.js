const mongoose = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');

const Zone = require('../models/companies/geoObjectZone');
const Track = require('../models/companies/geoObjectTrack');
const Work = require('../models/common/work');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');

class GeoObjectServices{

    constructor(){
        this.geoObject = undefined; 
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewGeoObject(geoObjectType, data){
        if(geoObjectType == "zone"){
            const tempZone = await Zone.findGeoObjectByRef("companyId", companyId, {_id:1}, session);
            
            if(tempZone.length != 0){
                throw ApiError.badRequest("Zone already exist. Only one zone is allowed for a company.");
            }
            this.geoObject = new Zone(data);
            this.result = await this.geoObject.save();
        }else if(geoObjectType == "track"){
            this.geoObject = new Track(data);
            this.result = await this.geoObject.save();
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }
        return this.result;
    }

    async getAllGeoObject(geoObjectType, companyId){
        if(geoObjectType == "zone"){
            this.result = await Zone.findAllGeoObject(companyId);
        }else if(geoObjectType == "track"){
            this.result = await Track.findAllGeoObject(companyId);
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }
        return this.result;
    }

    async getGeoOjectById(geoObjectType, id){
        if(geoObjectType == "zone"){
            this.result = await Zone.findGeoObjectById(id);
        }else if(geoObjectType == "track"){
            this.result = await Track.findGeoObjectById(id);
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }
        return this.result;
    }

    async updateGeoObjectById(geoObjectType, id, updateData){
        const { updateType, geoObject, wasteDump } = updateData;
        const session  = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async () => {
                if(updateType == "default"){//update description, resize, reposition
                    if(geoObjectType == "zone"){
                        this.result  = await Zone.updateGeoObjectById(id, geoObject, session);
                    }else if(geoObjectType == "track"){
                        this.result  = await Track.updateGeoObjectById(id, geoObject, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                }else if(updateType == "remapping"){
                    let tempWork;
                    if(geoObjectType == "track"){
                        tempWork = await Work.findWorkByRef("geoObjectTrackId", id, {workStatus:1, geoObjectTrackId:1}, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                    const blockFlag = _.findIndex(tempWork, w => {
                        return (w.workStatus == "confirmed" || w.workStatus == "on progress");
                    });

                    //checking if any work referring this geoObject is confirmed or under progress
                    if(blockFlag != -1){
                        _.remove( tempWork, w => { return w.workStatus == "finished" });

                        const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", id, {isCollected:1, geoObjectId:1}, session);
                        _.remove( tempWasteDump, wd => { return wd.isCollected == true });

                        /** remapping
                         * remappingData:{
                         *  geoObjectId:{prevGeoObjectId:"", newGeoObjectId:""},
                         * }
                        */
                        const { geoObjectId } = wasteDump.remappingData;
                        
                        tempWasteDump.forEach(wd => {
                            wd.geoObjectId = geoObjectId.newGeoObjectId;
                        });

                        tempWasteDump.forEach(async wd => {
                            this.result.wasteDump = await WasteDump.updateWasteDumpById(wd._id, { geoObjectId:wd.geoObjectId }, session);
                        });

                        if (geoObjectType == "track"){
                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geoObjectTrackId, id );
                                w.geoObjectTrackId[index] = geoObjectId.newGeoObjectId;
                            });
                        }else{
                            throw ApiError.badRequest("geo object type not valid");
                        }

                        tempWork.forEach(async w => {
                            if(geoObjectType == "track"){
                                this.result.work = await Work.updateWorkById(w._id, { geoObjectTrackId:w.geoObjectTrackId }, session);
                            }else{
                                throw ApiError.badRequest("geo object type not valid");
                            }
                        });
                        
                    }else{
                        throw ApiError.badRequest("Work is confirmed or under progress");
                    }
                }else{
                    throw ApiError.badRequest("update type not valid");
                }
    
            });

            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("Geo object update transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Geo object update transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }

    async deleteGeoObjectById(geoObjectType, id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                const work = [];
                const customerUsedGeoObject = [];

                //removing non collected wasteDump
                const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", id, {isCollected:1}, session);
                _.remove(tempWasteDump, o => o.isCollected == true );
                tempWasteDump.forEach(async wd => {
                    await WasteDump.deleteWasteDumpById( wd._id, session );
                });
                
                if(geoObjectType == "track"){
                    //removing geoObject ref from work
                    const tempWork = await Work.findWorkByRef("geoObjectTrackId", id, {geoObjectTrackId}, session);
                    tempWork.forEach( w => {
                        _.remove(w.geoObjectTrackId, got => got == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectTrackId:w.geoObjectTrackId}});
                    })
                    //removing geoObject ref from customerUsedGeoObject
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.TrackId", id, {}, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.usedTrack, o => o.trackId == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.usedTrack.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedTrack:cugo.usedTrack
                        }});
                    });
                    //deleting geoObject
                    await Track.deleteGeoObjectById(id, session);

                }else{
                    throw ApiError.badRequest("geo object type not valid");
                }
                work.forEach( async w => {
                    const { workId, workUpdateData } = w;
                    await Work.updateWorkById(workId, workUpdateData, session);
                });

                customerUsedGeoObject.forEach( async cugo => {
                    const {customerUsedGeoObjectId, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData } = cugo;
                    if(deleteCustomerUsedGeoObject){
                        await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectById(customerUsedGeoObjectId, session);
                    }else{
                        await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(customerUsedGeoObjectId, 
                            customerUsedGeoObjectUpdateData, session);
                    } 
                });
            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Geo object delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Geo object delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.GeoObjectServices = GeoObjectServices;
