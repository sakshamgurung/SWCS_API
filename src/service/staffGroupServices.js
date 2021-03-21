const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const _ = require('lodash');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

const StaffGroup = require('../models/staff/staffGroup');
const Work = require('../models/common/work');
const StaffDetail = require('../models/staff/staffDetail');
const CustomerRequest = require('../models/common/customerRequest');

class StaffGroupServices{

    constructor(){
        this.staffGroup = undefined;
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async createNewStaffGroup(staffGroupData){
        this.staffGroup = new StaffGroup(staffGroupData);
        this.result = await this.staffGroup.save();
        return this.result;
    }

    async getAllStaffGroup(companyId){
        this.result = await StaffGroup.findAll(companyId);
        return this.result;
    }

    async getStaffGroupById(id){
        this.result = await StaffGroup.findById(id);
        return this.result;
    }

    async updateStaffGroupById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async () => {
                const prevStaffGroupData = await StaffGroup.findById(id, {}, session);
                const {staffId} = prevStaffGroupData[0];
                const deletedGroupMember = _.difference(staffId, updateData.staffId);
                const addedGroupMember = _.difference(updateData.staffId, staffId);
                
                if(deletedGroupMember.length > 0){
                    for(let gm of deletedGroupMember ){
                        this.result = await StaffDetail.updateById(gm, {staffGroupId:""}, session);
                        checkForWriteErrors(this.result, "none", "Staff group update failed");
                    }
                }
                if(addedGroupMember.length > 0){
                    for(let gm of addedGroupMember ){
                        this.result = await StaffDetail.updateById(gm, {staffGroupId:id}, session);
                        checkForWriteErrors(this.result, "none", "Staff group update failed");
                    }
                }
        
                this.result = await StaffGroup.updateById(id, updateData);
                checkForWriteErrors(this.result, "none", "Staff group update failed");
            });
            
            return checkTransactionResults(this.transactionResults, "status", "Staff group update transaction failed");
            
        }catch(e){
            throw ApiError.serverError("Staff group update transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
    
    async deleteStaffGroupById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {
                
                //removing deleted staffGroupId from the staffDetail collection
                const tempStaffDetail = await StaffDetail.findByRef("staffGroupId", id, {}, session);
                for(let sd of tempStaffDetail ){
                    this.result = await StaffDetail.updateById(sd._id, {staffGroupId:""}, session);
                    checkForWriteErrors(this.result, "none", "Staff group delete failed");    
                }
                
                //removing deleted staffgroup from the work collection's staffGroupId field
                this.result = await Work.updateByRef("staffGroupId", id, {staffGroupId:""}, session);
                checkForWriteErrors(this.result, "none", "Staff group delete failed");
                
                //removing deleted staffgroup from the customerRequest collection's staffGroupId field
                this.result = await CustomerRequest.updateByRef("staffGroupId", id, {staffGroupId:""}, session);
                checkForWriteErrors(this.result, "none", "Staff group delete failed");
                
                this.result = await StaffGroup.deleteById(id, session);
                checkForWriteErrors(this.result, "none", "Staff group delete failed");

                //notify group member

            });

            return checkTransactionResults(this.transactionResults, "status", "Staff group delete transaction failed");

        } catch(e){
            throw ApiError.serverError("Staff group delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.StaffGroupServices = StaffGroupServices;
