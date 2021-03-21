const mongoose  = require('mongoose');
const _ = require('lodash');
const ApiError = require('../error/ApiError');
const {checkTransactionResults, checkForWriteErrors} = require('../utilities/errorUtil');

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
        const session = await mongoose.startSession();
        try{
            this.transactionResults =  await session.withTransaction(async() => {
                this.result = {};
                const {staffId} = staffDetail;
                
                this.staffDetail = new StaffDetail(staffDetail);
                this.result.staffDetail = await this.staffDetail.save({session});

                let result = await StaffLogin.updateById(staffId, {firstTimeLogin:false}, session);
                checkForWriteErrors(result, "none", "New staff info failed");
            });
            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("New staff info transaction failed");
            }
        }catch(e){
            throw ApiError.serverError("New staff info transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
        return this.result;
    }

    async getAllStaff(staffInfoType, companyId){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.findAll(companyId);
        }else if(staffInfoType == "staff-detail"){
            this.result =  await StaffDetail.findAll(companyId);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }
        return this.result;
    }

    async getStaffById(staffInfoType, id){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.findById(id);
        }else if(staffInfoType == "staff-detail"){
            this.result =await StaffDetail.findById(id);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }
        return this.result;
    }

    async updateStaffById(staffInfoType, id, updateData){
        if(staffInfoType == "staff"){
            this.result = await StaffLogin.updateById(id, updateData);
        }else if(staffInfoType == "staff-detail"){
            this.result = await StaffDetail.updateById(id, updateData);
        }else{
            throw ApiError.badRequest("staffInfoType not found!!!");
        }

        return checkForWriteErrors(this.result, "status", "Staff update failed");
    }
    
    //delete the staff and its information and references
    async deleteStaffById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {

                //removing deleted staff from the staffGroup collection's staffId field
                const tempStaffGroup = await StaffGroup.findByRef("staffId", id, {}, session);
                _.remove(tempStaffGroup[0].staffId, o => o == id);
                const staffGroupId = tempStaffGroup[0]._id;
                const staffId = tempStaffGroup[0].staffId;
                this.result = await StaffGroup.updateById(staffGroupId, {staffId}, session);
                checkForWriteErrors(this.result, "none", "Staff delete failed");
                
                //removing staff notification
                this.result = await Notification.deleteByRole('staff', id, session);
                checkForWriteErrors(this.result, "none", "Staff delete failed");
                
                this.result = await StaffLogin.deleteById(id, session);
                checkForWriteErrors(this.result, "none", "Staff delete failed");
                this.result = await StaffDetail.deleteById(id, session);
                checkForWriteErrors(this.result, "none", "Staff delete failed");
                
                //notify groupMember about removed staff
            });

            return checkTransactionResults(this.transactionResults, "status", "Staff delete transaction failed");

        }catch(e){
            throw ApiError.serverError("Staff delete transaction abort due to error: " + e.message);
        } finally{
            session.endSession();
        }
    }
}

exports.StaffServices = StaffServices;
