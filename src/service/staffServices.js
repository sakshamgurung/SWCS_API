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
        this.transactionResults = undefined;
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
                
        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Staff update failed");
        }
    }

    //delete the staff and its information and references
    async deleteStaffById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {

                //removing deleted staff from the staffGroup collection's staffId field
                const tempStaffGroup = await StaffGroup.findStaffGroupByRef("staffId", id, {}, session);
                _.remove(tempStaffGroup[0].staffId, o => o == id);
                const staffGroupId = tempStaffGroup[0]._id;
                const staffId = tempStaffGroup[0].staffId;
                staffGroup = await StaffGroup.updateStaffGroupById(staffGroupId, {staffId}, session);
                
                //removing staff notification
                Notification.deleteNotificationByRole('staff', id, session);

                await StaffLogin.deleteStaffById(id, session);
                await StaffDetail.deleteStaffDetailById(id, session);
                
                //notify groupMember about removed staff
            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Staff delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Staff delete transaction abort due to error: " + e.message);
        } finally{
            session.endSession();
        }
    }
}

exports.StaffServices = StaffServices;
