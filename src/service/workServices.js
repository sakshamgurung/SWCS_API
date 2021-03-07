const mongoose = require('mongoose');
const _ = require('lodash');

const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const Point = require('../models/companies/geoObjectPoint')
const Zone = require('../models/companies/geoObjectZone')

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

    async updateWorkById(id, updateData){
        const session = await mongoose.startSession();
        try{
            await session.withTransaction(async()=> {
                const prevWork = await Work.findWorkById(id, session);

                if(prevWork.workStatus == "unconfirmed"){
                    const deletedPointId = _.difference(prevWork.geoObjectPointId, updateData.geoObjectPointId);
                    const addedPointId = _.difference(updateData.geoObjectPointId, prevWork.geoObjectPointId);
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

                    const deletedZoneId = _.difference(prevWork.geoObjectZoneId, updateData.geoObjectZoneId);
                    const addedZoneId = _.difference(updateData.geoObjectZoneId, prevWork.geoObjectZoneId);
                    if(deletedZoneId.length > 0 ){
                        deletedZoneId.forEach(async z => { 
                            this.result.zone = await Zone.updateGeoObjectById(z, {workId:""},  session);
                        });
                    }
                    if(addedZoneId.length > 0 ){
                        addedZoneId.forEach(async z => { 
                            this.result.zone = await Zone.updateGeoObjectById(z, {workId:id},  session);
                        });
                    }

                    this.result.work = await Work.updateWorkById(id, updateData, session);
                    //notify staffId and staffGroupId after deleting work
                
                }else if(prevWork.workStatus == "confirmed" && updateData.workStatus == "on progress"){

                    const zoneId = await Zone.findGeoObjectByRef("workId", id, session);
                    zoneId.forEach(async z => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedZone.zoneId", z._id, session);
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

                }else if(prevWork.workStatus == "on progress" && updateData.workStatus == "finished" ){
                    this.result = { geoObjectPoint:[], geoObjectZone:[] };
                    
                    const zoneId = await Zone.findGeoObjectByRef("workId", id, session);
                    zoneId.forEach(async z => {
                        const customerId = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedZone.zoneId", z._id, session);
                        customerId.forEach(async c => {
                            _.remove( c.usedZone, uz => { return uz.zoneId == z._id; });
                            const customerId = c.customerId;
                            const customerUsedGeoObjectUpdateData = { usedZone:c.usedZone };
                            this.result.customerUsedGeoObject = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customerId", customerId, 
                            customerUsedGeoObjectUpdateData, session);
                        });
                        const result = await Zone.updateGeoObjectById(z._id, { workId:"" }, session);
                        this.result.geoObjectZone.push(result);
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
                this.result = { geoObjectPoint:[], geoObjectZone:[] };

                //deleting customerRequest ref from schedule
                this.result.schedule = await Schedule.deleteScheduleByRef("workId", id, session);

                //deleting work ref from geoObjectPoint
                const tempPoint = await Point.findGeoObjectByRef("workId", id, session);

                tempPoint.forEach(async p => {
                    const result = await Point.updateGeoObjectById(p._id, { workId:"" }, session);
                    this.result.geoObjectPoint.push(result);
                });
                
                //deleting work ref from geoObjectZone
                const tempZone = await Zone.findGeoObjectByRef("workId", id, session);

                tempZone.forEach(async z => {
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
