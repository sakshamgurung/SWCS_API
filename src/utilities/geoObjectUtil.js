const _ = require("lodash");

function geoObjectClientToServer(body) {
	//body is a complex mongoose object so change it to simple object to modify
	const fBody = body;
	const fPoints = [];

	if (fBody.hasOwnProperty("trackPoints")) {
		fBody.trackPoints.forEach((o) => {
			fPoints.push({
				identifier: o.identifier,
				coordinates: {
					latitude: o.latitude,
					longitude: o.longitude,
				},
			});
		});
		fBody.trackPoints = fPoints;
	} else if (fBody.hasOwnProperty("zonePoints")) {
		fBody.zonePoints.forEach((o) => {
			fPoints.push({
				identifier: o.identifier,
				coordinates: {
					latitude: o.latitude,
					longitude: o.longitude,
				},
			});
		});
		fBody.zonePoints = fPoints;
	}

	return fBody;
}

function geoObjectServerToClient(result) {
	//result is a complex mongoose object so change it to simple object to modify
	const fResult = result.toObject();
	const fPoints = [];

	if (fResult.hasOwnProperty("trackPoints")) {
		fResult.trackPoints.forEach((o) => {
			fPoints.push({
				identifier: o.identifier,
				latitude: o.coordinates.latitude,
				longitude: o.coordinates.longitude,
			});
		});
		fResult.trackPoints = fPoints;
	} else if (fResult.hasOwnProperty("zonePoints")) {
		fResult.zonePoints.forEach((o) => {
			fPoints.push({
				identifier: o.identifier,
				latitude: o.coordinates.latitude,
				longitude: o.coordinates.longitude,
			});
		});
		fResult.zonePoints = fPoints;
	}

	return fResult;
}

function geoObjectArrayClientToServer(arrayBody) {
	const fResult = [];
	arrayBody.forEach((o) => {
		fResult.push(geoObjectClientToServer(o));
	});
	return fResult;
}

function geoObjectArrayServerToClient(arrayResult) {
	const fResult = [];
	arrayResult.forEach((o) => {
		fResult.push(geoObjectServerToClient(o));
	});
	return fResult;
}

function customerRequestClientToServer(body) {
	const fBody = body;
	if (fBody.hasOwnProperty("requestCoordinate")) {
		const { identifier, latitude, longitude } = fBody.requestCoordinate;
		fBody.requestCoordinate = {
			identifier,
			coordinates: { latitude, longitude },
		};
	}
	return fBody;
}

function customerRequestServerToClient(result) {
	//result is a complex mongoose object so change it to simple object to modify
	const fResult = result.toObject();

	let { identifier, coordinates } = fResult.requestCoordinate;
	let { latitude, longitude } = coordinates;
	fResult.requestCoordinate = { identifier, latitude, longitude };

	return fResult;
}

function customerRequestArrayServerToClient(arrayResult) {
	const fResult = [];
	arrayResult.forEach((o) => {
		o = o.toObject();
		if (o.hasOwnProperty("requestCoordinate")) {
			const { identifier, coordinates } = o.requestCoordinate;
			const { latitude, longitude } = coordinates;
			o.requestCoordinate = { identifier, latitude, longitude };
		}
		fResult.push(o);
	});
	return fResult;
}

module.exports = {
	geoObjectClientToServer,
	geoObjectServerToClient,
	geoObjectArrayClientToServer,
	geoObjectArrayServerToClient,
	customerRequestClientToServer,
	customerRequestServerToClient,
	customerRequestArrayServerToClient,
};
