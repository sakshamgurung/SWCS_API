const mongoose = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');

const Zone = require('../models/companies/geoObjectZone');
const Point = require('../models/companies/geoObjectPoint');
const Track = require('../models/companies/geoObjectTrack');
const Work = require('../models/common/work');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');

class GeoObjectServices{

    constructor(){
        this.geoObject = undefined; 
        this.result = undefined;
    }
    
    async createNewGeoObject(geoObjectType, data){
        if(geoObjectType == "zone"){
            this.geoObject = new Zone(data);
            this.result = await this.geoObject.save();
        }else if(geoObjectType == "point"){
            this.geoObject = new Point(data);
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
        }else if(geoObjectType == "point"){
            this.result = await Point.findAllGeoObject(companyId);
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
        }else if(geoObjectType == "point"){
            this.result = await Point.findGeoObjectById(id);
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
            await session.withTransaction(async () => {
                if(updateType == "default"){//update description, resize, reposition
                    if(geoObjectType == "zone"){
                        this.result  = await Zone.updateGeoObjectById(id, geoObject, session);
                    }else if(geoObjectType == "point"){
                        this.result  = await Point.updateGeoObjectById(id, geoObject, session);
                    }else if(geoObjectType == "track"){
                        this.result  = await Track.updateGeoObjectById(id, geoObject, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                }else if(updateType == "remapping"){
                    let tempWork;
                    if(geoObjectType == "zone"){
                        tempWork = await Work.findWorkByRef("geoObjectZoneId", id, session);
                    }else if(geoObjectType == "point"){
                        tempWork = await Work.findWorkByRef("geoObjectPointId", id, session);
                    }else{
                        throw ApiError.badRequest("geo object type not valid");
                    }
                    const blockFlag = _.findIndex(tempWork, w => {
                        return (w.workStatus == "confirmed" || w.workStatus == "on progress");
                    });

                    //checking if any work referring this geoObject is confirmed or under progress
                    if(blockFlag != -1){
                        _.remove( tempWork, w => { return w.workStatus == "finished" });

                        const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", id, session);
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

                        if (geoObjectType == "zone"){
                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geoObjectZoneId, id );
                                w.geoObjectZoneId[index] = geoObjectId.newGeoObjectId;
                            });
                        }else if (geoObjectType == "point"){
                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geoObjectPointId, id );
                                w.geoObjectPointId[index] = geoObjectId.newGeoObjectId;
                            });
                        }else{
                            throw ApiError.badRequest("geo object type not valid");
                        }

                        tempWork.forEach(async w => {
                            if(geoObjectType == "zone"){
                                this.result.work = await Work.updateWorkById(w._id, { geoObjectZoneId:w.geoObjectZoneId }, session);
                            }else if(geoObjectType == "point"){
                                this.result.work = await Work.updateWorkById(w._id, { geoObjectPointId:w.geoObjectPointId }, session);
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
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async deleteGeoObjectById(geoObjectType, id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = { wasteDump:[], geoObject:[], work:[], customerUsedGeoObject:[] };
                const work = [];
                const customerUsedGeoObject = [];

                //removing non collected wasteDump
                const tempWasteDump = await WasteDump.findWasteDumpByRef("geoObjectId", id, session);
                _.remove(tempWasteDump, o => o.isCollected == true );
                tempWasteDump.forEach(async wd => {
                    const result = await WasteDump.deleteWasteDumpById( wd._id, session );
                    this.result.wasteDump.push(result);
                });
                
                if(geoObjectType == "zone"){
                    //removing geoObject ref from work
                    const tempWork = await Work.findWorkByRef("geoObjectZoneId", id, session);
                    tempWork.forEach( w => {
                        _.remove(w.geoObjectZoneId, goz => goz == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectZoneId:w.geoObjectZoneId}});
                    })
                    //removing geoObject ref from customerUsedGeoObject
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedZone.zoneId", id, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.usedZone, o => o.zoneId == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.usedTrack.length == 0 && cugo.usedZone.length == 0 && cugo.usedPoint.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedZone:cugo.usedZone
                        }});
                    });
                    //deleting geoObject
                    this.result.geoObject  = await Zone.deleteGeoObjectById(id, session);

                }else if(geoObjectType == "point"){
                    //removing geoObject ref from work
                    const tempWork = await Work.findWorkByRef("geoObjectPointId", id, session);
                    tempWork.forEach( w => {
                        _.remove(w.geoObjectPointId, gop => gop == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectPointId:w.geoObjectPointId}});
                    })
                    //removing geoObject ref from customerUsedGeoObject
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedPoint.pointId", id, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.usedPoint, o => o.pointId == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.usedTrack.length == 0 && cugo.usedZone.length == 0 && cugo.usedPoint.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedPoint:cugo.usedPoint
                        }});
                    });
                    //deleting geoObject
                    this.result.geoObject  = await Point.deleteGeoObjectById(id, session);
                }else{
                    throw ApiError.badRequest("geo object type not valid");
                }
                work.forEach( async w => {
                    const { workId, workUpdateData } = w;
                    const result =  await Work.updateWorkById(workId, workUpdateData, session);
                    this.result.work.push(result);
                });

                customerUsedGeoObject.forEach( async cugo => {
                    const {customerUsedGeoObjectId, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData } = cugo;
                    if(deleteCustomerUsedGeoObject){
                        const result = await CustomerUsedGeoObject.deleteCustomerUsedGeoObjectById(customerUsedGeoObjectId, session);
                        this.result.customerUsedGeoObject.push(result);
                    }else{
                        const result = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(customerUsedGeoObjectId, 
                            customerUsedGeoObjectUpdateData, session);
                        this.result.customerUsedGeoObject.push(result);
                    } 
                });
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.GeoObjectServices = GeoObjectServices;
