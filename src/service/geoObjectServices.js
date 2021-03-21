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
        if(updateData.hasOwnProperty("workId") || updateData.hasOwnProperty("wasteCondition")){
            throw ApiError.badRequest("work id and waste condition are not allowed to update from here.");
        }
        if(geoObjectType == "zone"){
            this.result  = await Zone.updateById(id, updateData, session);
        }else if(geoObjectType == "track"){
            this.result  = await Track.updateById(id, updateData, session);
        }else{
            throw ApiError.badRequest("geo object type not valid");
        }

        return checkForWriteErrors(this.result, "status", "Geo object updated failed");
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
