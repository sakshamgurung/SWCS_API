const mongoose = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');
const {geoObjectServerToClient, geoObjectArrayServerToClient} = require('../utilities/geoObjectUtil');

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
            const {companyId} = data;
            const tempZone = await Zone.findByRef("companyId", companyId, {_id:1});
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

        this.result = geoObjectServerToClient(this.result);
        return this.result;
    }
    
    async getAllGeoObject(geoObjectType, companyId){
        if(geoObjectType == "zone"){
            this.result = await Zone.findAll(companyId);
        }else if(geoObjectType == "track"){
            this.result = await Track.findAll(companyId);
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }
        this.result = geoObjectArrayServerToClient(this.result);
        return this.result;
    }
    
    async getGeoOjectById(geoObjectType, id){
        if(geoObjectType == "zone"){
            this.result = await Zone.findById(id);
        }else if(geoObjectType == "track"){
            this.result = await Track.findById(id);
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }
        this.result = geoObjectArrayServerToClient(this.result);
        return this.result;
    }

    async updateGeoObjectById(geoObjectType, id, updateData){
        const { updateType, geoObject, wasteDump } = updateData;
        const session  = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async () => {
                //update description, resize, reposition
                if(updateType == "default"){
                    if(geoObjectType == "zone"){
                        this.result  = await Zone.updateById(id, geoObject, session);
                    }else if(geoObjectType == "track"){
                        this.result  = await Track.updateById(id, geoObject, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                    checkForWriteErrors(this.result, "none", "Geo object updated failed");

                }else if(updateType == "remapping"){
                    let tempWork;
                    if(geoObjectType == "track"){
                        tempWork = await Work.findByRef("geoObjectTrackId", id, {workStatus:1, geoObjectTrackId:1}, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                    const blockFlag = _.findIndex(tempWork, w => {
                        return (w.workStatus == "confirmed" || w.workStatus == "on progress");
                    });

                    //checking if any work referring this geoObject is confirmed or under progress
                    if(blockFlag != -1){
                        _.remove( tempWork, w => { return w.workStatus == "finished" });

                        const tempWasteDump = await WasteDump.findByRef("geoObjectId", id, {isCollected:1, geoObjectId:1}, session);
                        _.remove( tempWasteDump, wd => { return wd.isCollected == true });

                        /** remapping
                         * remappingData:{
                         *  geoObjectId:{prevGeoObjectId:"", newGeoObjectId:""},
                         * }
                        */
                        const { newGeoObjectId } = wasteDump.remappingData.geoObjectId;
                        for(let wd of tempWasteDump ){
                            this.result = await WasteDump.updateById(wd._id, { geoObjectId:newGeoObjectId }, session);
                            checkForWriteErrors(this.result, "none", "Geo object updated failed");
                        }

                        if (geoObjectType == "track"){
                            for(let w of tempWork ){
                                const index = _.indexOf(w.geoObjectTrackId, id );
                                w.geoObjectTrackId[index] = newGeoObjectId;
                                this.result = await Work.updateById(w._id, { geoObjectTrackId:w.geoObjectTrackId }, session);
                                checkForWriteErrors(this.result, "none", "Geo object updated failed");
                            }
                        }
                        
                    }else{
                        throw ApiError.badRequest("Work is confirmed or under progress");
                    }
                }else{
                    throw ApiError.badRequest("update type not valid");
                }
                
            });

            return checkTransactionResults(this.transactionResults, "status", "Geo object update transaction failed");
            
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
                
                //removing non collected wasteDump
                const tempWasteDump = await WasteDump.findByRef("geoObjectId", id, {isCollected:1}, session);
                _.remove(tempWasteDump, o => o.isCollected == true );
                for(let wd of tempWasteDump ){
                    this.result = await WasteDump.deleteById( wd._id, session ); 
                    checkForWriteErrors(this.result, "none", "Geo object delete failed");
                }
                
                if(geoObjectType == "track"){
                    //removing geoObject ref from work
                    const tempWork = await Work.findByRef("geoObjectTrackId", id, {geoObjectTrackId}, session);
                    for(let w of tempWork ){
                        _.remove(w.geoObjectTrackId, got => got == id);
                        this.result = await Work.updateById(w._id, {geoObjectTrackId:w.geoObjectTrackId}, session);
                        checkForWriteErrors(this.result, "none", "Geo object delete failed");
                    }
                    
                    //removing geoObject ref from customerUsedGeoObject
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findByRef("usedTrack.TrackId", id, {}, session);
                    tempCustomerUsedGeoObjects.forEach(async cugo => {
                        _.remove(cugo.usedTrack, o => o.trackId == id );
                        if(cugo.usedTrack.length == 0){
                            this.result = await CustomerUsedGeoObject.deleteById(cugoId, session);
                            checkForWriteErrors(this.result, "none", "Geo object delete failed");
                        }else{
                            this.result = await CustomerUsedGeoObject.updateById(cugo._id, {usedTrack:cugo.usedTrack}, session);
                            checkForWriteErrors(this.result, "none", "Geo object delete failed");
                        }
                    });
                    //deleting geoObject
                    this.result = await Track.deleteById(id, session);
                    checkForWriteErrors(this.result, "none", "Geo object delete failed");
                }else{
                    throw ApiError.badRequest("geo object type not valid");
                }
            });

            return checkTransactionResults(this.transactionResults, "status", "Geo object delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Geo object delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.GeoObjectServices = GeoObjectServices;
