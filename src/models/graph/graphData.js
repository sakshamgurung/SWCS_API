const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		companyId: {
			type: Schema.Types.ObjectId
		},
		subscribers: {
			type: String
		},
		staff: {
			type: String
		},
		vehicle: {
			type: String
		},
		date: {
			type: Date,
			default: Date.now
		}
	},

	{
		collection: "graphData"
	}
);

module.exports = mongoose.model("graphData", schema);
