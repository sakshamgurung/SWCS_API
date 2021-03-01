const WasteDump = require('../models/customers/wasteDump');

class WasteDumpServices{

    constructor(){
        this.wasteDump = undefined;
        this.result = undefined;
    }
    
    async createNewWasteDump(wasteDumpData){
        this.wasteDump = new WasteDump(wasteDumpData);
        this.result = await this.wasteDump.save();
        return this.result;
    }

    async getAllWasteDump(customerId, companyId){
        this.result = await WasteDump.findAllWasteDump(customerId, companyId);
        return this.result;
    }

    async getWasteDumpById(id){
        this.result = await WasteDump.findWasteDumpById(id);
        return this.result;
    }
    //new
    async getWasteDumpByRef(ref, id){
        this.result = await WasteDump.findWasteDumpByRef(ref, id);
        return this.result;
    }
    async updateWasteDumpById(id, updateData){
        this.result = await WasteDump.updateWasteDumpById(id, updateData);
        return this.result;
    }

    async deleteWasteDumpById(id, updateData){
        this.result = await WasteDump.deleteWasteDumpById(id);
        return this.result;
    }
}

exports.WasteDumpServices = WasteDumpServices;
