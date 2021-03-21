const mongoose = require('mongoose');
const _ = require('lodash');
const { checkTransactionResults, checkForWriteErrors } = require('../utilities/errorUtil');

const Work = require('../models/common/work');
const Schedule = require('../models/customers/schedule');
const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const StaffGroup = require('../models/staff/staffGroup');
const Vehicle = require('../models/companies/vehicle');
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
                
                const tempStaffGroup = await StaffGroup.findById(staffGroupId, {isReserved:1}, session);
                const tempVehicle = await Vehicle.findById(vehicleId, {isReserved:1}, session);
                
                if(tempStaffGroup[0].isReserved){
                    throw ApiError.badRequest("staff group already reserved.");
                }

                if(tempVehicle[0].isReserved){
                   throw ApiError.badRequest("vehicle already reserved.");
                }
                // reserving staffgroup and vehicle
                let result  = await  StaffGroup.updateById(staffGroupId, {isReserved:true}, session);
                checkForWriteErrors(result, "none", "New work failed");
                
                result = await  Vehicle.updateById(vehicleId, {isReserved:true}, session);
                checkForWriteErrors(result, "none", "New work failed");
                
                // creating new work
                this.work = new Work(workData);
                this.result.work = await this.work.save({session});
                const workId = this.result.work._id;
                
                /**
                 * work ref in track
                 * use for...of rather than forEach because forEach will throw error inside from different context 
                 * */
                for(let tid of geoObjectTrackId){
                    result = await Track.updateById(tid, {workId}, session);
                    checkForWriteErrors(result, "none", "New work failed");
                }
                
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
        this.result = await Work.findAll(role, id);
        return this.result;
    }

    async getWorkById(id){
        this.result = await Work.findById(id);
        return this.result;
    }

    async updateWorkById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async()=> {
                const prevWork = await Work.findById(id, {workStatus:1, geoObjectTrackId:1, staffGroupId, vehicleId}, session);
                const {workStatus, geoObjectTrackId, staffGroupId, vehicleId} = prevWork[0];

                if(workStatus == "unconfirmed"){
                    if(staffGroupId != updateData.staffGroupId){
                        //reserving new staffgroup
                        const tempStaffGroup = await StaffGroup.findById(updateData.staffGroupId, {isReserved:1}, session);
                        
                        if(tempStaffGroup[0].isReserved){
                            throw ApiError.badRequest("staff group already reserved.");
                        }

                        this.result= await  StaffGroup.updateById(updateData.staffGroupId, {isReserved:true}, session);
                        checkForWriteErrors(this.result, "none", "Work update failed");
                        
                        //free previous staffgroup
                        this.result = await  StaffGroup.updateById(staffGroupId, {isReserved:false}, session);
                        checkForWriteErrors(this.result, "none", "Work update failed");
                    }

                    if(vehicleId != updateData.vehicleId){
                        //reserving new vehicle
                        const tempVehicle = await Vehicle.findById(updateData.vehicleId, {isReserved:1}, session);
                        
                        if(tempVehicle[0].isReserved){
                            throw ApiError.badRequest("staff group already reserved.");
                        }
                        
                        this.result = await  Vehicle.updateById(updateData.vehicleId, {isReserved:true}, session);
                        checkForWriteErrors(this.result, "none", "Work update failed");
                        
                        //free previous vehicle
                        this.result = await  Vehicle.updateById(vehicleId, {isReserved:false}, session);
                        checkForWriteErrors(this.result, "none", "Work update failed");
                    }
                    
                    const deletedTrackId = _.difference(geoObjectTrackId, updateData.geoObjectTrackId);
                    const addedTrackId = _.difference(updateData.geoObjectTrackId, geoObjectTrackId);
                    
                    if(deletedTrackId.length > 0 ){
                        for(let t of deletedTrackId){
                            this.result = await Track.updateById(t, {workId:""},  session);
                            checkForWriteErrors(this.result, "none", "Work update failed");
                        }
                    }
                    if(addedTrackId.length > 0 ){
                        for(let t of addedTrackId){
                            this.result = await Track.updateById(t, {workId:id},  session);
                            checkForWriteErrors(this.result, "none", "Work update failed");
                        }
                    }
                    
                    this.result = await Work.updateById(id, updateData, session);
                    checkForWriteErrors(this.result, "none", "Work update failed");
                    //notify staffGroupId after deleting work
                    
                }else if(workStatus == "confirmed" && updateData.workStatus == "on progress"){
                    const trackId = await Track.findByRef("workId", id, {_id:1}, session);
                    for(let t of trackId){
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {customerId:1}, session);
                        for(let cugo of tempCustomerUsedGeoObject){
                            const {customerId} = cugo;
                            const newSchedule = {
                                customerId,
                                workId:id
                            }
                            await Schedule.create([newSchedule], {session});
                        }
                    }
                    
                    this.result = await Work.updateById(id, { workStatus:"on progress" }, session);
                    checkForWriteErrors(this.result, "none", "Work update failed");
                    
                }else if(workStatus == "on progress" && updateData.workStatus == "finished" ){
                    
                    const trackId = await Track.findByRef("workId", id, {_id:1}, session);
                    for(let t of trackId){
                        const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findByRef("usedTrack.trackId", t._id, {}, session);
                        for(let cugo of tempCustomerUsedGeoObject){
                            _.remove( cugo.usedTrack, o => { return o.trackId == t._id; });
                            const {customerId, usedTrack} = cugo;
                            this.result = await CustomerUsedGeoObject.updateByRef("customerId", customerId, { usedTrack }, session);
                            checkForWriteErrors(this.result, "none", "Work update failed");
                        }
                        this.result = await Track.updateById(t._id, { workId:"" }, session);
                        checkForWriteErrors(this.result, "none", "Work update failed");
                    }
                    
                    this.result = await Schedule.deleteByRef("workId", id, session);
                    checkForWriteErrors(this.result, "none", "Work update failed");
                    this.result = await Work.updateById(id, { workStatus:"finished" }, session);
                    checkForWriteErrors(this.result, "none", "Work update failed");
                    
                }
            });
            
            return checkTransactionResults(this.transactionResults, "status", "Work update transaction failed");
            
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
                const tempWork = await Work.findById(id, {}, session);
                const {staffGroupId, vehicleId} = tempWork;
                
                //deleting work ref from schedule
                this.result = await Schedule.deleteByRef("workId", id, session);
                checkForWriteErrors(this.result, "none", "Work delete failed");
                
                //deleting work ref from geoObjectTrack
                const tempTrack = await Track.findByRef("workId", id, {_id:1}, session);
                for(let t of tempTrack){
                    this.result = await Track.updateById(t._id, { workId:"" }, session);
                    checkForWriteErrors(this.result, "none", "Work delete failed");
                }
                
                //free vehicle
                this.result = await  StaffGroup.updateById(staffGroupId, {isReserved:false}, session);
                checkForWriteErrors(this.result, "none", "Work delete failed");
                
                //free staffgroup
                this.result = await  Vehicle.updateeById(vehicleId, {isReserved:false}, session);
                checkForWriteErrors(this.result, "none", "Work delete failed");
                
                this.result = await Work.deleteById(id, session);
                checkForWriteErrors(this.result, "none", "Work delete failed");
            });
            
            return checkTransactionResults(this.transactionResults, "status", "Work delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Work delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.WorkServices = WorkServices;
