const mongoose = require('mongoose');
const _ = require('lodash');

const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const StaffGroup = require('../models/staff/staffGroup');
const Vehicle = require('../models/companies')
const Track = require('../models/companies/geoObjectTrack');
const ApiError = require('../error/ApiError');

class WorkServices{

    constructor(){
        this.work = undefined;
        this.result = undefined;
        this.transactionResults = undefined; 
    }
    
    async createNewWork(workData){
        this.result = {};
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async()=>{
                const {geoObjectTrackId, staffGroupId, vehicleId} = workData;
                
                const tempStaffGroup = await StaffGroup.findStaffGroupById(staffGroupId, {isReserved:1}, session);
                const tempVehicle = await Vehicle.findVehicleById(vehicleId, {isReserved:1}, session);
                
                if(tempStaffGroup[0].isReserved){
                    throw ApiError.badRequest("staff group already reserved.");
                }

                if(tempVehicle[0].isReserved){
                   throw ApiError.badRequest("vehicle already reserved.");
                }
                // reserving staffgroup and vehicle
                this.result.staffGroup = await  StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:true}, session);
                this.result.vehicle = await  Vehicle.updateVehicleById(vehicleId, {isReserved:true}, session);
                
                // creating new work
                this.work = new Work(workData);
                this.result.work = await this.work.save({session});
                const workId = this.result._id;

                //work ref in track
                geoObjectTrackId.forEach(async tid => {
                    this.result.geoObjectTrack = await Track.updateGeoObjectById(tid, {workId}, session);
                });
                
            });
                        
            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("New work transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("New work transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
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
            this.transactionResults = await session.withTransaction(async()=> {
                const prevWork = await Work.findWorkById(id, {workStatus:1, geoObjectTrackId:1, staffGroupId, vehicleId}, session);
                const {workStatus, geoObjectTrackId, staffGroupId, vehicleId} = prevWork[0];

                if(workStatus == "unconfirmed"){
                    this.result = {staffGroup:[], vehicle:[], track:[]};

                    if(staffGroupId != updateData.staffGroupId){
                        //reserving new staffgroup
                        const tempStaffGroup = await StaffGroup.findStaffGroupById(updateData.staffGroupId, {isReserved:1}, session);
                        
                        if(tempStaffGroup[0].isReserved){
                            throw ApiError.badRequest("staff group already reserved.");
                        }

                        let result = await  StaffGroup.updateStaffGroupById(updateData.staffGroupId, {isReserved:true}, session);
                        this.result.staffGroup.push(result);
                        
                        //free previous staffgroup
                        result = await  StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:false}, session);
                        this.result.staffGroup.push(result);
                    }

                    if(vehicleId != updateData.vehicleId){
                        //reserving new vehicle
                        const tempVehicle = await Vehicle.findVehicleById(updateData.vehicleId, {isReserved:1}, session);
                        
                        if(tempVehicle[0].isReserved){
                            throw ApiError.badRequest("staff group already reserved.");
                        }

                        let result = await  Vehicle.updateVehicleById(updateData.vehicleId, {isReserved:true}, session);
                        this.result.vehicle.push(result);

                        //free previous vehicle
                        result = await  Vehicle.updateVehicleById(vehicleId, {isReserved:false}, session);
                        this.result.vehicle.push(result);
                    }

                    const deletedTrackId = _.difference(geoObjectTrackId, updateData.geoObjectTrackId);
                    const addedTrackId = _.difference(updateData.geoObjectTrackId, geoObjectTrackId);

                    if(deletedTrackId.length > 0 ){
                        deletedTrackId.forEach(async t => { 
                            const result = await Track.updateGeoObjectById(t, {workId:""},  session);
                            this.result.track.push(result);
                        });
                    }
                    if(addedTrackId.length > 0 ){
                        addedTrackId.forEach(async t => { 
                            const result = await Track.updateGeoObjectById(t, {workId:id},  session);
                            this.result.track.push(result);
                        });
                    }

                    this.result.work = await Work.updateWorkById(id, updateData, session);
                    //notify staffGroupId after deleting work
                
                }else if(workStatus == "confirmed" && updateData.workStatus == "on progress"){
                    this.result = {schedule:[]}
                    const trackId = await Track.findGeoObjectByRef("workId", id, {_id:1}, session);
                    trackId.forEach(async t => {
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.trackId", t._id, {customerId:1}, session);
                        tempCustomerUsedGeoObject.forEach(async cugo => {
                            const {customerId} = cugo;
                            const newSchedule = {
                                customerId,
                                workId:id
                            }
                            const result = await Schedule.create([newSchedule], {session});
                            this.result.schedule.push(result);
                        });
                    });
                    
                    this.result.work = await Work.updateWorkById(id, { workStatus:"on progress" }, session);

                }else if(workStatus == "on progress" && updateData.workStatus == "finished" ){
                    this.result = { geoObjectTrack:[], customerUsedGeoObject:[] };
                    
                    const trackId = await Track.findGeoObjectByRef("workId", id, {_id:1}, session);
                    trackId.forEach(async t => {
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.trackId", t._id, {}, session);
                        tempCustomerUsedGeoObject.forEach(async cugo => {
                            _.remove( cugo.usedTrack, o => { return o.trackId == t._id; });
                            const {customerId, usedTrack} = cugo;
                            const result = await CustomerUsedGeoObject.updateCustomerUsedGeoObjectByRef("customerId", customerId, 
                            { usedTrack }, session);
                            this.result.customerUsedGeoObject.push(result);
                        });
                        const result = await Track.updateGeoObjectById(t._id, { workId:"" }, session);
                        this.result.geoObjectTrack.push(result);
                    });

                    this.result.schedule = await Schedule.deleteScheduleByRef("workId", id, session);
                    this.result.work = await Work.updateWorkById(id, { workStatus:"finished" }, session);
                    
                }
            });

            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("Work update transaction failed");
            }
              
        }catch(e){
                throw ApiError.serverError("Work update transaction abort due to error: " + e.message);
        } finally{
            session.endSession();
        }
    }

    async deleteWorkById(id, updateData){//delete ref also
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async() => {
                const tempWork = await Work.findWorkById(id, {}, session);
                const {staffGroupId, vehicleId} = tempWork;

                //deleting work ref from schedule
                await Schedule.deleteScheduleByRef("workId", id, session);
                
                //deleting work ref from geoObjectTrack
                const tempTrack = await Track.findGeoObjectByRef("workId", id, {_id:1}, session);

                tempTrack.forEach(async t => {
                    await Track.updateGeoObjectById(t._id, { workId:"" }, session);
                });

                //free vehicle
                await  StaffGroup.updateStaffGroupById(staffGroupId, {isReserved:false}, session);
                
                //free staffgroup
                await  Vehicle.updateVehicleById(vehicleId, {isReserved:false}, session);
                
                await Work.deleteWorkById(id, session);
            });
            
            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Work delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Work delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WorkServices = WorkServices;
