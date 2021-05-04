const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		from: {
			role: {
				type: String,
				enum: ["company", "staff", "customer", "superadmin"],
			},
			id: {
				type: String,
			},
		},
		to: {
			role: {
				type: String,
				enum: ["company", "staff", "customer", "superadmin"],
			},
			id: {
				type: String,
			},
		},
		targetCollection: {
			name: {
				type: String,
			},
			id: {
				type: String,
			},
		},
		sentDate: {
			type: Schema.Types.Date,
		},
		message: {
			type: Schema.Types.Mixed,
		},
	},
	{
		collection: "notifications",
	}
);

class HelperClass {
	static findAll(role, id, query, projection, session) {
		if (session == undefined) {
			return this.find({ $and: [{ "to.role": role }, { "to.id": id }, query] }, projection);
		} else {
			return this.find({ $and: [{ "to.role": role }, { "to.id": id }, query] }, projection, { session });
		}
	}

	static deleteByRole(role, id, query, session) {
		if (session == undefined) {
			return this.deleteMany({
				$and: [{ "to.role": role }, { "to.id": id }, query],
			});
		} else {
			return this.deleteMany({ $and: [{ "to.role": role }, { "to.id": id }, query] }, { session });
		}
	}
}

schema.loadClass(HelperClass);

module.exports = Notification = mongoose.model("Notification", schema);
