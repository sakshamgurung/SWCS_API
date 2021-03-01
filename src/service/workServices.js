const mongoose = require('mongoose');
const _ = require('lodash');

const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const Point = require('../models/companies/geoObjectPoint')
const Track = require('../models/companies/geoObjectTrack')
const Zone = require('../models/companies/geoObjectZone')
const {ScheduleServices} = require('./scheduleServices');

class WorkServices{

    constructor(){
        this.work = undefined;
        this.result = undefined;
    }
    
    async createNewWork(workData){
        this.work = new Work(workData);
        this.result = await this.work.save();
        return this.result;
    }

    async getAllWork(role, id, idArray){
        this.result = await Work.findAllWork(role, id, idArray);
        return this.result;
    }

    async getWorkById(id){
        this.result = await Work.findWorkById(id);
        return this.result;
    }
    //new
    async getWorkByRef(ref, id){
        this.result = await Work.findWorkByRef(ref, id);
        return this.result;
    }

    async updateWorkById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async()=> {
                const prevWork = await Work.findWorkById(id, session);

                if(prevWork.work_status == "unconfirmed"){
                    const deletedPointId = _.difference(prevWork.geo_object_point_id, updateData.geoObjectPointId);
                    const addedPointId = _.difference(updateData.geoObjectPointId, prevWork.geo_object_point_id);
                    if(deletedPointId.length > 0 ){
                        deletedPointId.forEach( p => { 
                            this.result.point = await Point.updateGeoObjectById(p, {work_id:""},  session);
                        });
                    }
                    if(addedPointId.length > 0 ){
                        addedPointId.forEach( p => { 
                            this.result.point = await Point.updateGeoObjectById(p, {work_id:id},  session);
                        });
                    }

                    const deletedTrackId = _.difference(prevWork.geo_object_track_id, updateData.geoObjectTrackId);
                    const addedTrackId = _.difference(updateData.geoObjectTrackId, prevWork.geo_object_track_id);
                    if(deletedTrackId.length > 0 ){
                        deletedTrackId.forEach( t => { 
                            this.result.track = await Track.updateGeoObjectById(t, {work_id:""},  session);
                        });
                    }
                    if(addedTrackId.length > 0 ){
                        addedTrackId.forEach( t => { 
                            this.result.track = await Track.updateGeoObjectById(t, {work_id:id},  session);
                        });
                    }

                    const deletedZoneId = _.difference(prevWork.geo_object_zone_id, updateData.geoObjectZoneId);
                    const addedZoneId = _.difference(updateData.geoObjectZoneId, prevWork.geo_object_zone_id);
                    if(deletedZoneId.length > 0 ){
                        deletedZoneId.forEach( z => { 
                            this.result.zone = await Zone.updateGeoObjectById(z, {work_id:""},  session);
                        });
                    }
                    if(addedZoneId.length > 0 ){
                        addedZoneId.forEach( z => { 
                            this.result.zone = await Zone.updateGeoObjectById(z, {work_id:id},  session);
                        });
                    }

                    this.result.work = await Work.updateWorkById(id, updateData, session);
                    //notify staff_id and staff_group_id after deleting work
                
                }else if(prevWork.work_status == "confirmed" && updateData.work_status == "on progress"){
                    const trackId = await Track.findGeoObjectByRef("work-id", id, session);
                    trackId.forEach( t => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-track.track-id", t._id, session);
                        customerId.forEach( c => {
                            const newSchedule = {
                                customer_id:c.customer_id,
                                work_id:id
                            }
                            this.result.schedule = await Schedule.create([newSchedule], {session});
                        });
                    });
                    
                    const zoneId = await Zone.findGeoObjectByRef("work-id", id, session);
                    zoneId.forEach( z => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-zone.zone-id", z._id, session);
                        customerId.forEach( c => {
                            const newSchedule = {
                                customer_id:c.customer_id,
                                work_id:id
                            }
                            this.result.schedule = await Schedule.create([newSchedule], {session});
                        });
                    });
                    
                    const pointId = await Point.findGeoObjectByRef("work-id", id, session);
                    pointId.forEach( p => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-point.point-id", p._id, session);
                        customerId.forEach( c => {
                            const newSchedule = {
                                customer_id:c.customer_id,
                                work_id:id
                            }
                            this.result.schedule = await Schedule.create([newSchedule], {session});
                        });
                    });
                    
                    this.result.work = await Work.updateWorkById(id, { work_status:"on progress" }, session);

                }else if(prevWork.work_status == "on progress" && updateData.work_status == "finished" ){
                    this.result = { geoObjectPoint:[], geoObjectTrack:[], geoObjectZone:[] };
                    
                    const trackId = await Track.findGeoObjectByRef("work-id", id, session);
                    trackId.forEach( t => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-track.track-id", t._id, session);
                        customerId.forEach( c => {
                            _.remove( c.used_track, ut => { return ut.track_id == t._id; });
                            const customerUsedGeoObjectUpdateData = { used_track:c.used_track };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customer-id", c.customer_id, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Track.updateGeoObjectById(t._id, {workId:""}, session);
                        this.result.geoObjectTrack.push(result);
                    });

                    
                    const zoneId = await Zone.findGeoObjectByRef("work-id", id, session);
                    zoneId.forEach( z => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-zone.zone-id", z._id, session);
                        customerId.forEach( c => {
                            _.remove( c.used_zone, uz => { return uz.zone_id == z._id; });
                            const customerId = c.customer_id;
                            const customerUsedGeoObjectUpdateData = { used_zone:c.used_zone };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customer-id", customerId, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Zone.updateGeoObjectById(z._id, { workId:"" }, session);
                        this.result.geoObjectZone.push(result);
                    });
                    
                    const pointId = await Point.findGeoObjectByRef("work-id", id, session);
                    pointId.forEach( p => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("used-point.point-id", p._id, session);
                        customerId.forEach( c => {
                            _.remove( c.used_point, up => { return up.point_id == p._id; });
                            const customerId = c.customer_id;
                            const customerUsedGeoObjectUpdateData = { used_point:c.used_point };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customer-id", customerId, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Point.updateGeoObjectById(p._id, { workId:"" }, session);
                        this.result.geoObjectPoint.push(result);
                    });

                    this.result.schedule = await Schedule.deleteScheduleByRef("work-id", id, session);
                    this.result.work = await Work.updateWorkById(id, { work_status:"finished" }, session);
                    
                }
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async deleteWorkById(id, updateData){//delete ref also
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async() => {
                this.result = { geoObjectPoint:[], geoObjectTrack:[], geoObjectZone:[] };
                const geoObjectPoint, geoObjectZone, geoObjectTrack = [];

                //deleting customer_request ref from schedule
                this.result.schedule = await Schedule.deleteScheduleByRef("work-id", id, session);

                //deleting work ref from geo_object_point
                const tempPoint = await Point.findGeoObjectByRef("work-id", id, session);

                tempPoint.forEach(p => {
                    const result = await Point.updateGeoObjectById(p._id, { workId:"" }, session);
                    this.result.geoObjectPoint.push(result);
                });
                
                //deleting work ref from geo_object_track
                const tempTrack = await Track.findGeoObjectByRef("work-id", id, session);

                tempTrack.forEach(t => {
                    const result = await Track.updateGeoObjectById(t._id, { workId:"" }, session);
                    this.result.geoObjectTrack.push(result);
                });
                
                //deleting work ref from geo_object_zone
                const tempZone = await Zone.findGeoObjectByRef("work-id", id, session);

                tempZone.forEach(z => {
                    const result = await Zone.updateGeoObjectById(z._id, { workId:"" }, session);
                    this.result.geoObjectZone.push(result);
                });
                
                this.result.work = await Work.deleteWorkById(id, session);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.WorkServices = WorkServices;
