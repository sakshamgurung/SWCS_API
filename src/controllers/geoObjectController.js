const {GeoObjectServices} = require('../service/geoObjectServices');

class GeoObjectController{
    async createNewGeoObject(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const companyId = request.params.id;
            let data = undefined;
            if(geoObjectType == "track"){
                const {trackName, trackPoints, trackCheckpoints, workId, wasteCondition, description} = request.body;
                data = {
                    companyId,
                    trackName,
                    track_points:trackPoints,
                    track_checkpoints:trackCheckpoints,
                    workId,
                    wasteCondition,
                    description
                }
            }else if(geoObjectType == "zone"){
                const {zoneName, zonePoints, workId, wasteCondition, description} = request.body;
                data = {
                    companyId,
                    zoneName,
                    zone_points:zonePoints,
                    workId,
                    wasteCondition,
                    description
                }
            }else if(geoObjectType == "point"){
                const {pointName, coordinate, workId, wasteCondition, description} = request.body;
                data = {
                    companyId,
                    pointName,
                    coordinate,
                    workId,
                    wasteCondition,
                    description
                }
            }
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.createNewGeoObject(geoObjectType, data);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getAllGeoObject(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const companyId = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.getAllGeoObject(geoObjectType, companyId);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async getGeoObjectById(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const id = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.getGeoOjectById(geoObjectType, id);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async updateGeoObjectById(request, response, next){
        try{
            const geoObjectType = request.params.type;
            const id = request.params.id;
            let updateData = null;
            if(geoObjectType == "track"){
                const {trackName, trackPoints, trackCheckpoints, workId, wasteCondition, description} = request.body;
                updateData = {
                    trackName,
                    track_points:trackPoints,
                    track_checkpoints:trackCheckpoints,
                    workId,
                    wasteCondition,
                    description
                };
            }else if(geoObjectType == "zone"){
                const {zoneName, zonePoints, workId, wasteCondition, description} = request.body;
                updateData = {
                    zoneName,
                    zone_points:zonePoints,
                    workId,
                    wasteCondition,
                    description
                };
            }else if(geoObjectType == "point"){
                const {pointName, coordinate, workId, wasteCondition, description} = request.body;
                updateData = {
                    pointName,
                    coordinate,
                    workId,
                    wasteCondition,
                    description
                };
            }

            if(_.isEmpty(updateData)){
                throw new Error("updataData is empty");
            }

            const fields = Object.keys(updateData);
            fields.forEach((field) => {
                if(updateData[field] == undefined){
                    delete updateData[field];
                }
            });
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.updateGeoObjectById(geoObjectType, id, updateData);
            response.json(result);
        }catch(error){
            console.error(error.message);
            response.json({error:500});
        }
    }

    async deleteGeoObjectById(request, response, next){
        try {
            const geoObjectType = request.params.type;
            const id = request.params.id;
            
            const geoObjectServices = new GeoObjectServices();
            const result = await geoObjectServices.deleteGeoObjectById(geoObjectType, id);
            response.json(result);
        } catch (error) {
            console.error(error.message);
            response.json({error:500});
        }
    }
}

exports.GeoObjectController = GeoObjectController;