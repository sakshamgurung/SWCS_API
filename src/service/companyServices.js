const mongoose  = require('mongoose');
const ApiError = require('../error/ApiError');

const CompanyLogin = require('../models/companies/companyLogin');
const CompanyDetail = require('../models/companies/companyDetail');
const CompanyServiceDetail = require('../models/companies/companyServiceDetail');

const Vehicle = require('../models/companies/vehicle');
const Track = require('../models/companies/geoObjectTrack');
const Zone = require('../models/companies/geoObjectZone');
const WasteList = require('../models/companies/wasteList');

const StaffLogin = require('../models/staff/staffLogin');
const StaffDetail = require('../models/staff/staffDetail');
const StaffGroup = require('../models/staff/staffGroup');

const CustomerRequest = require('../models/common/customerRequest');
const Notification = require('../models/common/notification');
const Subscription = require('../models/common/subscription');
const Work = require('../models/common/work');

const CustomerUsedGeoObject = require('../models/customers/customerUsedGeoObject');
const Schedule = require('../models/customers/schedule');
const WasteDump = require('../models/customers/wasteDump');

class CompanyServices{

    constructor(){
        this.companyDetail = undefined; 
        this.companyServiceDetail = undefined; 
        this.result = undefined;
        this.transactionResults = undefined;
    }
    
    async newCompanyInfo(companyDetail, companyServiceDetail){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {
                this.result = {};

                this.companyDetail = new CompanyDetail(companyDetail);
                this.result.companyDetail = await this.companyDetail.save({session});

                this.companyServiceDetail = new CompanyServiceDetail(companyServiceDetail);
                this.result.companyServiceDetail = await this.companyServiceDetail.save({session});

                const {companyId} = this.result.companyServiceDetail;
                this.result.companyLogin = await CompanyLogin.updateCompanyById(companyId, {firstTimeLogin:false}, session);
            });
            
            if(this.transactionResults){
                return this.result;
            }else{
                throw ApiError.serverError("New company info transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("New company info transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }

    async getAllCompany(companyInfoType){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.findAllCompany();
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.findAllCompanyDetail();
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.findAllCompanyServiceDetail();
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }
        return this.result;
    }
    async getCompanyById(companyInfoType, id){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.findCompanyById(id);
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.findCompanyDetailById(id);
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.findCompanyServiceDetailById(id);
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }
        return this.result;
    }

    async updateCompanyById(companyInfoType, id, updateData){
        if(companyInfoType == "company"){
            this.result = await CompanyLogin.updateCompanyById(id, updateData);
        }else if(companyInfoType == "company-detail"){
            this.result = await CompanyDetail.updateCompanyDetailById(id, updateData);
        }else if(companyInfoType == "company-service-detail"){
            this.result = await CompanyServiceDetail.updateCompanyServiceDetailById(id, updateData);
        }else{
            throw ApiError.badRequest("companyInfoType not found!!!");
        }

        if(!this.result.hasOwnProperty("writeErrors")){
            return this.result;
        }else{
            throw ApiError.serverError("Company update failed");
        }
    }

    async deleteCompanyById(id, updateData){
        const session = await mongoose.startSession();
        try {
            this.transactionResults = await session.withTransaction(async() => {
                //deleting uncollected waste dump of company
                const tempWasteDump = await WasteDump.findWasteDumpByRef("companyId", id, {isCollected:1}, session);
                const archiveWasteDump = _.remove(tempWasteDump, o => o.isCollected == true);
                archiveWasteDump.forEach(async wd => {
                    await WasteDump.updateWasteDumpById( wd._id, { customerId:"", companyId:"" }, session );
                });
                tempWasteDump.forEach(async wd => {
                    await WasteDump.deleteWasteDumpById( wd._id, session );
                });

                //deleting notification
                const tempSubscription = await Subscription.findAllSubscriber(id, {customerId:1}, session);
                tempSubscription.forEach(async s => {
                    await Notification.deleteNotificationByRole("customer", s.customerId, session);
                });
                
                const tempStaffLogin = await StaffLogin.findStaffByRef("companyId", id, {_id:1}, session);
                tempStaffLogin.forEach(async sl => {
                    await Notification.deleteNotificationByRole("staff", sl._id, session);
                });
                
                await Notification.deleteNotificationByRole("company", id, session);
                
                //deleting schedule
                const tempWork = await Work.findWorkByRef("companyId", id, {_id}, session);
                tempWork.forEach(async w => {
                    await Schedule.deleteScheduleByRef("workId", w._id, session);
                });
                
                const tempCustomerRequest = await CustomerRequest.findCustomerRequestByRef("companyId", id, {_id}, session);
                tempCustomerRequest.forEach(async cr => {
                    await Schedule.deleteScheduleByRef("customerRequestId", cr._id, session);
                });
                
                //updating customer used geoObject
                const tempTrack = await Track.findGeoObjectByRef("companyId", id, {_id}, session);
                tempTrack.forEach(async t => {
                    const tempCustomerUsedGeoObject = await CustomerUsedGeoObject.findCustomerUsedGeoObjectByRef("usedTrack.trackId", t._id, {}, session);
                    tempCustomerUsedGeoObject.forEach(async cugo => {
                        _.remove(cugo.usedTrack, o => o.trackId == t._id);
                        await CustomerUsedGeoObject.updateCustomerUsedGeoObjectById(cugo._id, {usedTrack}, session);
                    });
                });

                await Subscription.deleteSubscriptionByRef("companyId", id, session);
                await CustomerRequest.deleteCustomerRequestByRef("companyId", id, session);
                await Work.deleteWorkByRef("companyId", id, session);
                
                await Vehicle.deleteVehicleByRef("companyId", id, session);
                await Track.deleteGeoObjectByRef("companyId", id, session);
                await Zone.deleteGeoObjectByRef("companyId", id, session);
                await WasteList.deleteWasteListByRef("companyId", id, session);

                await StaffLogin.deleteStaffByRef("companyId", id, session);
                await StaffDetail.deleteStaffDetailByRef("companyId", id, session);
                await StaffGroup.deleteStaffGroupByRef("companyId", id, session);

                await CompanyDetail.deleteCompanyDetailByRef("companyId", id, session);
                await CompanyServiceDetail.deleteCompanyServiceDetailByRef("companyId", id, session);
                await CompanyLogin.deleteCompanyById(id);
            });

            if(this.transactionResults){
                return {statusCode:"200", status:"Success"}
            }else{
                throw ApiError.serverError("Company delete transaction failed");
            }

        }catch(e){
            throw ApiError.serverError("Company delete transaction abort due to error: " + e.message);
        }finally{
            session.endSession();
        }
    }
}

exports.CompanyServices = CompanyServices;
