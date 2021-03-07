const mongoose  = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');

const StaffLogin = require('../models/staff/staffLogin');
const StaffDetail = require('../models/staff/staffDetail');
const StaffGroup = require('../models/staff/staffGroup');
const Notification =  require('../models/common/notification');

class StaffServices{

    constructor(){
        this.staffDetail = undefined;
        this.result = undefined;
    }
    
    async newStaffInfo(staffDetail){
        this.staffDetail = new StaffDetail(staffDetail);
        this.result = await this.staffDetail.save();
        return this.result;
    }

    async getAllStaff(staffInfoType, companyId){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.findAllStaff(companyId);
        }else if(staffInfoType == "staff-detail"){
            this.result =  await StaffDetail.findAllStaffDetail(companyId);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }
        return this.result;
    }

    async getStaffById(staffInfoType, id){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.findStaffById(id);
        }else if(staffInfoType == "staff-detail"){
            this.result =await StaffDetail.findStaffDetailById(id);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }
        return this.result;
    }

    async updateStaffById(staffInfoType, id, updateData){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.updateStaffById(id, updateData);
        }else if(staffInfoType == "staff-detail"){
            this.result = await StaffDetail.updateStaffDetailById(id, updateData);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }
        return this.result;
    }

    //delete the staff and its information and references
    async deleteStaffById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {staffGroup:[]};
                const staffGroup = [];

                //removing deleted staff from the staffGroup collection's staffId field
                const tempStaffGroup = await StaffGroup.findStaffGroupByRef("staffId", id, session);
                tempStaffGroup.forEach( sg => {
                    _.remove(sg.staffId, o => o == id );
                    staffGroup.push({ staffGroupId:sg._id, staffGroupUpdateData:{ staffId:sg.staffId } });
                });
                staffGroup.forEach( async sg => {
                    const { staffGroupId, staffGroupUpdateData } = sg;
                    const result = await StaffGroup.updateStaffGroupById(staffGroupId, staffGroupUpdateData, session);
                    this.result.staffGroup.push(result);
                });
                
                //removing staff notification
                Notification.deleteNotificationByRole('staff', id, session);

                this.result.staffLogin = await StaffLogin.deleteStaffById(id, session);
                this.result.staffDetail = await StaffDetail.deleteStaffDetailById(id, session);
                
                //notify groupMember about removed staff
            });
        } finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.StaffServices = StaffServices;
