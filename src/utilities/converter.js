function mongooseToPlainObjectArray(mongooseObject) {
	const plainObjectArray = [];
	for (let doc of mongooseObject) {
		plainObjectArray.push(doc.toObject());
	}
	return plainObjectArray;
}

module.exports = {
	mongooseToPlainObjectArray,
};
