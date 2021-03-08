const mongoose = require('mongoose');
const _ = require('lodash');

const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const Point = require('../models/companies/geoObjectPoint')
const Track = require('../models/companies/geoObjectTrack')

class WorkServices{

    constructor(){
        this.work = undefined;
        this.result = undefined;
    }
    
    async createNewWork(workData){
        this.result = {};
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async()=>{
                this.work = new Work(workData);
                this.result.work = await this.work.save({session:session});
                const workId = this.result._id;

                workData.geoObjectPointId.forEach(async pid => {
                    this.result.geoObjectPoint = await Point.updateGeoObjectById(pid, {workId:workId}, session);
                });
                workData.geoObjectTrackId.forEach(async tid => {
                    this.result.geoObjectTrack = await Point.updateGeoObjectById(tid, {workId:workId}, session);
                });
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async getAllWork(role, id){
        this.result = await Work.findAllWork(role, id);
        return this.result;
    }

    async getWorkById(id){
        this.result = await Work.findWorkById(id);
        return this.result;
    }

    async updateWorkById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async()=> {
                const prevWork = await Work.findWorkById(id, session);

                if(prevWork[0].workStatus == "unconfirmed"){
                    const deletedPointId = _.difference(prevWork[0].geoObjectPointId, updateData.geoObjectPointId);
                    const addedPointId = _.difference(updateData.geoObjectPointId, prevWork[0].geoObjectPointId);
                    if(deletedPointId.length > 0 ){
                        deletedPointId.forEach(async p => { 
                            this.result.point = await Point.updateGeoObjectById(p, {workId:""},  session);
                        });
                    }
                    if(addedPointId.length > 0 ){
                        addedPointId.forEach(async p => { 
                            this.result.point = await Point.updateGeoObjectById(p, {workId:id},  session);
                        });
                    }

                    const deletedTrackId = _.difference(prevWork[0].geoObjectTrackId, updateData.geoObjectTrackId);
                    const addedTrackId = _.difference(updateData.geoObjectTrackId, prevWork[0].geoObjectTrackId);
                    if(deletedTrackId.length > 0 ){
                        deletedTrackId.forEach(async t => { 
                            this.result.Track = await Track.updateGeoObjectById(t, {workId:""},  session);
                        });
                    }
                    if(addedTrackId.length > 0 ){
                        addedTrackId.forEach(async t => { 
                            this.result.Track = await Track.updateGeoObjectById(t, {workId:id},  session);
                        });
                    }

                    this.result.work = await Work.updateWorkById(id, updateData, session);
                    //notify staffGroupId after deleting work
                
                }else if(prevWork[0].workStatus == "confirmed" && updateData.workStatus == "on progress"){

                    const trackId = await Track.findGeoObjectByRef("workId", id, session);
                    trackId.forEach(async t => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.trackId", t._id, session);
                        customerId.forEach(async c => {
                            const newSchedule = {
                                customerId:c.customerId,
                                workId:id
                            }
                            this.result.schedule = await Schedule.create([newSchedule], {session});
                        });
                    });
                    
                    const pointId = await Point.findGeoObjectByRef("workId", id, session);
                    pointId.forEach(async p => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedPoint.pointId", p._id, session);
                        customerId.forEach(async c => {
                            const newSchedule = {
                                customerId:c.customerId,
                                workId:id
                            }
                            this.result.schedule = await Schedule.create([newSchedule], {session});
                        });
                    });
                    
                    this.result.work = await Work.updateWorkById(id, { workStatus:"on progress" }, session);

                }else if(prevWork[0].workStatus == "on progress" && updateData.workStatus == "finished" ){
                    this.result = { geoObjectPoint:[], geoObjectTrack:[] };
                    
                    const trackId = await Track.findGeoObjectByRef("workId", id, session);
                    trackId.forEach(async t => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.trackId", t._id, session);
                        customerId.forEach(async c => {
                            _.remove( c.usedTrack, ut => { return ut.trackId == t._id; });
                            const customerId = c.customerId;
                            const customerUsedGeoObjectUpdateData = { usedTrack:c.usedTrack };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customerId", customerId, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Track.updateGeoObjectById(t._id, { workId:"" }, session);
                        this.result.geoObjectTrack.push(result);
                    });
                    
                    const pointId = await Point.findGeoObjectByRef("workId", id, session);
                    pointId.forEach(async p => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedPoint.pointId", p._id, session);
                        customerId.forEach(async c => {
                            _.remove( c.usedPoint, up => { return up.pointId == p._id; });
                            const customerId = c.customerId;
                            const customerUsedGeoObjectUpdateData = { usedPoint:c.usedPoint };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customerId", customerId, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Point.updateGeoObjectById(p._id, { workId:"" }, session);
                        this.result.geoObjectPoint.push(result);
                    });

                    this.result.schedule = await Schedule.deleteScheduleByRef("workId", id, session);
                    this.result.work = await Work.updateWorkById(id, { workStatus:"finished" }, session);
                    
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
                this.result = { geoObjectPoint:[], geoObjectTrack:[] };

                //deleting work ref from schedule
                this.result.schedule = await Schedule.deleteScheduleByRef("workId", id, session);

                //deleting work ref from geoObjectPoint
                const tempPoint = await Point.findGeoObjectByRef("workId", id, session);

                tempPoint.forEach(async p => {
                    const result = await Point.updateGeoObjectById(p._id, { workId:"" }, session);
                    this.result.geoObjectPoint.push(result);
                });
                
                //deleting work ref from geoObjectTrack
                const tempTrack = await Track.findGeoObjectByRef("workId", id, session);

                tempTrack.forEach(async t => {
                    const result = await Track.updateGeoObjectById(t._id, { workId:"" }, session);
                    this.result.geoObjectTrack.push(result);
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
