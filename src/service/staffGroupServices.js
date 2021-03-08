const mongoose = require('mongoose');
const _ = require('lodash');

const StaffGroup = require('../models/staff/staffGroup');
const Work = require('../models/common/work');
const StaffDetail = require('../models/staff/staffDetail');
const CustomerRequest = require('../models/common/customerRequest');

class StaffGroupServices{

    constructor(){
        this.staffGroup = undefined;
        this.result = undefined;
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
            await session.withTransaction(async () => {
                this.result = {};
                const prevStaffGroupData = await StaffGroup.findStaffGroupById(id, session);
        
                const deletedGroupMember = _.difference(prevStaffGroupData[0].staffId, updateData.staffId);
                const addedGroupMember = _.difference(updateData.staffId, prevStaffGroupData[0].staffId);
                
                if(deletedGroupMember.length > 0){
                    deletedGroupMember.forEach(async gm => {
                        const staffDetail = await StaffDetail.findStaffDetailById(gm, session);
                        const tempStaffGroupId = staffDetail[0].staffGroupId;
                        _.remove(tempStaffGroupId, staffGroupId => staffGroupId == id);
                        this.result.staffDetail = await StaffDetail.updateStaffDetailById(gm, {staffGroupId:tempStaffGroupId}, session);
                    });
                }
                if(addedGroupMember.length > 0){
                    addedGroupMember.forEach(async gm => {
                        const staffDetail = await StaffDetail.findStaffDetailById(gm, session);
                        const tempStaffGroupId = staffDetail[0].staffGroupId;
                        tempStaffGroupId.push(id);
                        this.result.staffDetail = await StaffDetail.updateStaffDetailById(gm, {staffGroupId:tempStaffGroupId}, session);
                    });
                }
        
                this.result.staffGroup = await StaffGroup.updateStaffGroupById(id, updateData);
            });
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async deleteStaffGroupById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = { staffDetail:[], work:[], customerRequest:[] };
                const work = [];
                const customerRequest = [];
                const staffDetail = [];
                
                //removing deleted staffGroup from the staffDetail collection's staffGroup field
                const tempStaffDetail = await StaffDetail.findStaffDetailByRef("staffGroupId", id, session);
                tempStaffDetail.forEach( sd => {
                    _.remove(sd.staffGroupId, o => o == id );
                    staffDetail.push({ staffDetailId:sd._id, staffDetailUpdateData:{ staffGroupId:sd.staffGroupId } });
                });
                staffDetail.forEach(async sd => {
                    const { staffDetailId, staffDetailUpdateData } = sd;                
                    const result = await StaffDetail.updateStaffDetailById(staffDetailId, staffDetailUpdateData, session);
                    this.result.staffDetail.push(result);
                });
                
                //removing deleted staff from the work collection's staffGroupId field
                const tempWork = await Work.findWorkByRef("staffGroupId", id, session);
                tempWork.forEach( w => {
                    _.remove(w.staffGroupId, o => o == id );
                    work.push({ workId:w._id, workUpdateData:{ staffGroupId:w.staffGroupId } });
                });
                work.forEach(async w => {
                    const { workId, workUpdateData } = w;
                    const result = await Work.updateWorkById(workId, workUpdateData, session);
                    this.result.work.push(result);
                });
                
                //removing deleted staff from the customerRequest collection's staffGroupId field
                const tempCustomerRequest = await CustomerRequest.findCustomerRequestByRef("staffGroupId", id, session);
                tempCustomerRequest.forEach( cr => {
                    _.remove(cr.staffGroupId, o => o == id );
                    customerRequest.push({ customerRequestId:cr._id, customerRequestUpdateData:{ staffGroupId:cr.staffGroupId } });
                });
                customerRequest.forEach( cr => {
                    const { customerRequestId, customerRequestUpdateData } = cr;
                    const result = await CustomerRequest.updateCustomerRequestById(customerRequestId, customerRequestUpdateData, session);
                    this.result.customerRequest.push(result);
                });

                this.result.staffGroup = await StaffGroup.deleteStaffGroupById(id, session);

                //notify group member

            });
        } finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.StaffGroupServices = StaffGroupServices;
