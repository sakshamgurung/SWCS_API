const mongoose = require('mongoose');
const ApiError = require('../error/ApiError');
const _ = require('lodash');

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
        this.result = await StaffGroup.findAllStaffGroup(companyId);
        return this.result;
    }

    async getStaffGroupById(id){
        this.result = await StaffGroup.findStaffGroupById(id);
        return this.result;
    }

    async updateStaffGroupById(id, updateData){
        const session = await mongoose.startSession();
        try{
            this.transactionResults = await session.withTransaction(async () => {
                this.result = {staffDetail:[]};
                const prevStaffGroupData = await StaffGroup.findStaffGroupById(id, {}, session);
        
                const deletedGroupMember = _.difference(prevStaffGroupData[0].staffId, updateData.staffId);
                const addedGroupMember = _.difference(updateData.staffId, prevStaffGroupData[0].staffId);
                
                if(deletedGroupMember.length > 0){
                    deletedGroupMember.forEach(async gm => {
                        const result = await StaffDetail.updateStaffDetailById(gm, {staffGroupId:""}, session);
                        this.result.staffDetail.push(result);
                    });
                }
                if(addedGroupMember.length > 0){
                    addedGroupMember.forEach(async gm => {
                        const result = await StaffDetail.updateStaffDetailById(gm, {staffGroupId:id}, session);
                        this.result.staffDetail.push(result);
                    });
                }
        
                this.result.staffGroup = await StaffGroup.updateStaffGroupById(id, updateData);
            });

            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("Staff group update transaction failed");
            }

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
                const tempStaffDetail = await StaffDetail.findStaffDetailByRef("staffGroupId", id, {}, session);
                tempStaffDetail.forEach(async sd => {               
                    await StaffDetail.updateStaffDetailById(sd._id, {staffGroupId:""}, session);
                });
                
                //removing deleted staffgroup from the work collection's staffGroupId field
                await Work.updateWorkByRef("staffGroupId", id, {staffGroupId:""}, session);
                
                //removing deleted staffgroup from the customerRequest collection's staffGroupId field
                await CustomerRequest.updateCustomerRequestByRef("staffGroupId", id, {staffGroupId:""}, session);

                await StaffGroup.deleteStaffGroupById(id, session);

                //notify group member

            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Staff group delete transaction failed");
            }

        } catch(e){
            throw ApiError.serverError("Staff group delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.StaffGroupServices = StaffGroupServices;
