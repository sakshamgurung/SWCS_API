const mongoose  = require('mongoose');

const StaffLogin = require('../models/staff/staffLogin');
const StaffDetail = require('../models/staff/staffDetail');
const Work = require('../models/common/work');
const CustomerRequest = require('../models/common/customerRequest');
const StaffGroup = require('../models/staff/staffGroup');
const Notification =  require('../models/common/notification');

class StaffServices{

    constructor(){
        this.staffLogin = undefined; 
        this.staffDetail = undefined;
        this.result = undefined;
    }
    
    async createNewStaff({staffLoginData, staffDetailData}){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = {};
                this.staffLogin = new StaffLogin(staffLoginData);
                this.result.staffLogin = await this.staffLogin.save({session:session});

                this.staffDetail = new StaffDetail(staffDetailData);
                this.result.staffDetail = await this.staffDetail.save({session:session});

            });
            
        } finally{
            session.endSession();
        }
        return this.result;
    }

    //staff_login
    async getAllStaff(companyId){
        this.result = await StaffLogin.findAllStaff(companyId);
        return this.result;
    }
    async getStaffById(id){
        this.result = await StaffLogin.findStaffById(id);
        return this.result;
    }
    //new
    async getStaffByUUID(uuidArray){
        this.result = await StaffLogin.findStaffByUUID(uuidArray);
        return this.result;
    }
    //new
    async getStaffByToken(token){
        this.result = await StaffLogin.findStaffByToken(token);
        return this.result;
    }
    //new
    async getStaffByRefreshToken(refreshToken){
        this.result = await StaffLogin.findStaffByRefreshToken(refreshToken);
        return this.result;
    }
    //new
    async getStaffByTimeStamp(timeStamp){
        this.result = await StaffLogin.findStaffByTimeStamp(timeStamp);
        return this.result;
    }
    async updateStaffById(id, updateData){
        this.result = await StaffLogin.updateStaffById(id, updateData);
        return this.result;
    }

    //staff_detail
    async getAllStaffDetail(companyId){
        this.result = await StaffDetail.findAllStaffDetail(companyId);
        return this.result;
    }
    async getStaffDetailById(id){
        this.result = await StaffDetail.findStaffDetailById(id);
        return this.result;
    }
    //new
    async getAllStaffDetailByStaffGroupIdArray(idArray){
        this.result = await StaffDetail.findAllStaffDetailByStaffGroupIdArray(idArray);
        return this.result;
    }
    //new
    async getStaffDetailByRef(ref, id){
        this.result = await StaffDetail.findStaffDetailByRef(ref, id);
        return this.result;
    }
    async updateStaffDetailById(id, updateData){
        this.result = await StaffDetail.updateStaffDetailById(id, updateData);
        return this.result;
    }

    //delete the staff and its information and references
    async deleteStaffById(id, updateData){
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async() => {
                this.result = { work:[], staffGroup:[], customerRequest:[] };
                const staffGroup = [];
                const work = [];
                const customerRequest = [];

                //removing deleted staff from the staff_group collection's staff_id field
                const tempStaffGroup = await StaffGroup.findStaffGroupByRef("staff-id", id, session);
                tempStaffGroup.forEach( sg => {
                    _.remove(sg.staff_id, o => { o == id });
                    staffGroup.push({ staffGroupId:sg._id, staffGroupUpdateData:{ staffId:sg.staff_id } });
                });
                staffGroup.forEach( sg => {
                    const { staffGroupId, staffGroupUpdateData } = sg;
                    const result = await StaffGroup.updateStaffGroupById(staffGroupId, staffGroupUpdateData, session);
                    this.result.staffGroup.push(result);
                });
                
                //removing deleted staff from the work collection's staff_id field
                const tempWork = await Work.findWorkByRef("staff-id", id, session);
                tempWork.forEach( w => {
                    _.remove(w.staff_id, o => { o == id });
                    work.push({ workId:w._id, workUpdateData:{ staffId:w.staff_id } });
                });
                work.forEach( w => {
                    const { workId, workUpdateData } = w;
                    const result = await Work.updateWorkById(workId, workUpdateData, session);
                    this.result.work.push(result);
                });
                
                //removing deleted staff from the customer_request collection's staff_id field
                const tempCustomerRequest = await CustomerRequest.findCustomerRequestByRef("staff-id", id, session);
                tempCustomerRequest.forEach( cr => {
                    _.remove(cr.staff_id, o => { o == id });
                    customerRequest.push({ customerRequestId:cr._id, customerRequestUpdateData:{ staffId:cr.staff_id } });
                });
                customerRequest.forEach( cr => {
                    const { customerRequestId, customerRequestUpdateData } = cr;
                    const result = await CustomerRequest.updateCustomerRequestById(customerRequestId, customerRequestUpdateData, session);
                    this.result.customerRequest.push(result);
                });
                
                //removing staff notification
                Notification.deleteNotificationByRole('staff', id, session);

                this.result.staffLogin = await StaffLogin.deleteStaffById(id, session);
                this.result.staffDetail = await StaffDetail.deleteStaffDetailById(id, session);
                
                //notify group_member about removed staff
            });
        } finally{
            session.endSession();
        }
        return this.result;
    }
}

exports.StaffServices = StaffServices;
