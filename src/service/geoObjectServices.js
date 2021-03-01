const mongoose = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');

const Track = require('../models/companies/geoObjectTrack');
const Zone = require('../models/companies/geoObjectZone');
const Point = require('../models/companies/geoObjectPoint');
const Work = require('../models/common/work');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const WasteDump = require('../models/customers/wasteDump');

class GeoObjectServices{

    constructor(){
        this.geoObject = undefined; 
        this.result = undefined;
    }
    
    async createNewGeoObject(geoObjectType, data){
        if(geoObjectType == "track"){
            this.geoObject = new Track(data);
            this.result = await this.geoObject.save();
        }else if(geoObjectType == "zone"){
            this.geoObject = new Zone(data);
            this.result = await this.geoObject.save();
        }else if(geoObjectType == "point"){
            this.geoObject = new Point(data);
            this.result = await this.geoObject.save();
        }
        return this.result;
    }

    async getAllGeoObject(geoObjectType, companyId){
        if(geoObjectType == "track"){
            this.result = await Track.findAllGeoObject(companyId);
        }else if(geoObjectType == "zone"){
            this.result = await Zone.findAllGeoObject(companyId);
        }else if(geoObjectType == "point"){
            this.result = await Point.findAllGeoObject(companyId);
        }
        return this.result;
    }

    async getGeoOjectById(geoObjectType, id){
        if(geoObjectType == "track"){
            this.result = await Track.findGeoObjectById(id);
        }else if(geoObjectType == "zone"){
            this.result = await Zone.findGeoObjectById(id);
        }else if(geoObjectType == "point"){
            this.result = await Point.findGeoObjectById(id);
        }
        return this.result;
    }
    //new
    async getGeoOjectByRef(geoObjectType, ref, id){
        try {
            switch(geoObjectType){
                case "track": this.result = await Track.findGeoObjectByRef(ref, id); break;
                case "zone": this.result = await Zone.findGeoObjectByRef(ref, id); break;
                case "point": this.result = await Point.findGeoObjectByRef(ref, id); break;
                default: return new Error("geoObjectType not define");
            }
        } catch (error) {
            console.error(error.message);
        }
        return this.result;
    }
    async updateGeoObjectById(geoObjectType, id, updateData){
        const { geoObject, wasteDump } = updateData;
        const session  = await mongoose.startSession();
        try{
            await session.withTransaction(async () => {
                if( wasteDump.remapping){
                    let tempWork;
                    if(geoObjectType == "track"){
                        tempWork = Work.findWorkByRef("geo-object-track-id", id, session);
                    }else if(geoObjectType == "zone"){
                        tempWork = Work.findWorkByRef("geo-object-zone-id", id, session);
                    }else if(geoObjectType == "point"){
                        tempWork = Work.findWorkByRef("geo-object-point-id", id, session);
                    }
                    const blockFlag = _.findIndex(tempWork, w => {
                        return (w.work_status == "confirmed" || w.work_status == "on progress");
                    });

                    //checking if any work referring this geoObject is confirmed or under progress
                    if(blockFlag != -1){
                        const tempWasteDump = WasteDump.findWasteDumpByRef("geo-object-id", id, session);
                        _.remove( tempWasteDump, wd => { wd.is_collected == true });
                        _.remove( tempWork, w => { w.work_status == "finished" });
                        //remapping
                        const { geoObjectId, geoObjectCheckPoints } = wasteDump.remappingData;
                        /**
                         * remappingData:{
                         *  geoObjectId:{prevGeoObjectId:"", newGeoObjectId:""},
                         *  geoObjectCheckPoints:[
                         *      {prevId:["_id", "_id",.....], newId:"_id"},
                         *      {prevId:["_id", "_id",.....], newId:"_id"},
                         *  ]
                         * }
                         */
                        
                        tempWasteDump.forEach(wd => {
                            wd.geo_object_id = geoObjectId.newGeoObjectId;
                        });

                        if(geoObjectType == "track"){
                            geoObjectCheckPoints.forEach( gocp => {
                                gocp.prevId.forEach( prevId => {
                                    for(let i = 0; i<tempWasteDump.length; i++){
                                        if(tempWasteDump[i].geo_object_checkpoints_id === prevId){
                                            tempWasteDump[i].geo_object_checkpoints_id = gocp.newId; 
                                        }
                                    }
                                });
                            });

                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geo_object_track_id, id );
                                w.geo_object_track_id[index] = geoObjectId.newGeoObjectId;
                            });
                        }else if (geoObjectType == "zone"){
                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geo_object_zone_id, id );
                                w.geo_object_zone_id[index] = geoObjectId.newGeoObjectId;
                            });
                        }else if (geoObjectType == "point"){
                            tempWork.forEach( w => {
                                const index = _.indexOf(w.geo_object_point_id, id );
                                w.geo_object_point_id[index] = geoObjectId.newGeoObjectId;
                            });
                        }

                        tempWork.forEach(w => {
                            if(geoObjectType == "track"){
                                this.result.work = await Work.updateWorkById(w._id, { geo_object_track_id:w.geo_object_track_id }, session);
                            }else if(geoObjectType == "zone"){
                                this.result.work = await Work.updateWorkById(w._id, { geo_object_zone_id:w.geo_object_zone_id }, session);
                            }else if(geoObjectType == "point"){
                                this.result.work = await Work.updateWorkById(w._id, { geo_object_point_id:w.geo_object_point_id }, session);
                            }
                        });
                        tempWasteDump.forEach(wd => {
                            this.result.wasteDump = await WasteDump.updateWasteDumpById(wd._id, { geo_object_id:wd.geo_object_id, 
                                geo_object_checkpoints_id:wd.geo_object_checkpoints_id }, session);
                        });
                    }else{
                        throw ApiError.badRequest("Work is confirmer or under progress");
                    }
                }
    
            });
        }finally{
            session.endSession();
        }
        
        if(geoObjectType == "track"){
            this.result  = await Track.updateGeoObjectById(id, geoObject);//move this up
        }else if(geoObjectType == "zone"){
            this.result  = await Zone.updateGeoObjectById(id, geoObject);
        }else if(geoObjectType == "point"){
            this.result  = await Point.updateGeoObjectById(id, geoObject);
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
                const tempWasteDump = await WasteDump.findWasteDumpByRef("geo-object-id", id, session);
                _.remove(tempWasteDump, o => o.is_collected == true );
                tempWasteDump.forEach(wd => {
                    const result = await WasteDump.deleteWasteDumpById( wd._id, session );
                    this.result.wasteDump.push(result);
                });
                
                if(geoObjectType == "track"){
                    //removing geoObject ref from work's geo_object_{}_id
                    const tempWork = await Work.findWorkByRef("geo-object-track-id", id, session);
                    tempWork.forEach( w => {
                        _.remove(w.geo_object_track_id, got => got == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectTrackId:w.geo_object_track_id}});
                    })
                    //removing geoObject ref from customer_used_geo_object
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-track.track-id", id, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.used_track, o => o.track_id == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.used_track.length == 0 && cugo.used_zone.length == 0 && cugo.used_point.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedTrack:cugo.used_track
                        }});
                    });
                    //deleting geoObject
                    this.result.geoObject  = await Track.deleteGeoObjectById(id, session);
                }else if(geoObjectType == "zone"){
                    //removing geoObject ref from work's geo_object_{}_id
                    const tempWork = await Work.findWorkByRef("geo-object-zone-id", id, session);
                    tempWork.forEach( w => {
                        _.remove(w.geo_object_zone_id, goz => goz == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectZoneId:w.geo_object_zone_id}});
                    })
                    //removing geoObject ref from customer_used_geo_object
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-zone.zone-id", id, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.used_zone, o => o.zone_id == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.used_track.length == 0 && cugo.used_zone.length == 0 && cugo.used_point.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedZone:cugo.used_zone
                        }});
                    });
                    //deleting geoObject
                    this.result.geoObject  = await Zone.deleteGeoObjectById(id, session);
                }else if(geoObjectType == "point"){
                    //removing geoObject ref from work's geo_object_{}_id
                    const tempWork = await Work.findWorkByRef("geo-object-point-id", id, session);
                    tempWork.forEach( w => {
                        _.remove(w.geo_object_point_id, gop => gop == id);
                        work.push({workId:w._id, workUpdateData:{geoObjectPointId:w.geo_object_point_id}});
                    })
                    //removing geoObject ref from customer_used_geo_object
                    const tempCustomerUsedGeoObjects = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-point.point-id", id, session);
                    tempCustomerUsedGeoObjects.forEach( cugo => {
                        _.remove(cugo.used_point, o => o.point_id == id );
                        let deleteCustomerUsedGeoObject = false;
                        if(cugo.used_track.length == 0 && cugo.used_zone.length == 0 && cugo.used_point.length == 0){
                            deleteCustomerUsedGeoObject = true;
                        }
                        customerUsedGeoObject.push({customerUsedGeoObjectId:cugo._id, deleteCustomerUsedGeoObject, customerUsedGeoObjectUpdateData:{
                            usedPoint:cugo.used_point
                        }});
                    });
                    //deleting geoObject
                    this.result.geoObject  = await Point.deleteGeoObjectById(id, session);
                }
                work.forEach( w => {
                    const { workId, workUpdateData } = w;
                    const result =  await Work.updateWorkById(workId, workUpdateData, session);
                    this.result.work.push(result);
                });

                customerUsedGeoObject.forEach( cugo => {
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
