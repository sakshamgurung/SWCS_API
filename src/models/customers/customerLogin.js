const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		email: {
			type: String,
		},
		mobileNo: {
			type: String,
		},
		password: {
			type: String,
			required: true,
		},
		firstTimeLogin: {
			type: Boolean,
		},
		token: {
			mobileDevice: [
				{
					uuid: String,
					token: String,
					createdDate: Schema.Types.Date,
					refreshToken: String,
					refreshTokenCreatedDate: Schema.Types.Date,
				},
			],
			webDevice: [
				{
					token: String,
					createdDate: Schema.Types.Date,
				},
			],
			//required:true
		},
		resetToken: {
			type: String,
		},
		resetTokenTimeStamp: {
			type: String,
		},
	},
	{
		collection: "customerLogins",
	}
);

class HelperClass {
	static findAllInIdArray(idArray, query, projection, session) {
		if (session == undefined) {
			return this.find(
				{ $and: [{ _id: { $in: idArray } }, query] },
				projection
			);
		} else {
			return this.find(
				{ $and: [{ _id: { $in: idArray } }, query] },
				projection,
				{ session }
			);
		}
	}

	static findByUUID(uuidArray, query, projection, session) {
		if (session == undefined) {
			return this.find(
				{
					$and: [
						{ "token.mobileDevice.uuid": { $in: uuidArray } },
						query,
					],
				},
				projection
			);
		} else {
			return this.find(
				{
					$and: [
						{ "token.mobileDevice.uuid": { $in: uuidArray } },
						query,
					],
				},
				projection,
				{ session }
			);
		}
	}
}

schema.loadClass(HelperClass);

module.exports = CustomerLogin = mongoose.model("CustomerLogin", schema);
