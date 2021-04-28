const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		email: {
			type: String
		},
		password: {
			type: String
		},
		token: {
			webDevice: [String]
		}
	},
	{
		collection: "superAdmin"
	}
);

module.exports = SuperAdmin = mongoose.model("SuperAdmin", schema);
