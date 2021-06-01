const admin = require("firebase-admin");
const _ = require("lodash");
const moment = require("moment");

const config = require("../config");

const { checkForWriteErrors } = require("../utilities/errorUtil");
const CompanyLogin = require("../models/companies/companyLogin");
const StaffLogin = require("../models/staff/staffLogin");
const CustomerLogin = require("../models/customers/customerLogin");
const Notification = require("../models/common/notification");

admin.initializeApp({
	credential: admin.credential.cert(config.fcmConfig),
	databaseURL: config.fcmURL,
});

let registrationTokens = null;

function sendNotifications(message) {
	admin
		.messaging()
		.sendMulticast(message)
		.then((response) => {
			const failedTokens = [];
			response.responses.forEach((resp, index) => {
				if (!resp.success) {
					failedTokens.push(registrationTokens[index]);
				}
			});
			console.log("Failed tokens list: " + failedTokens);
		});
}

async function storeNotification(from, toRole, targetCollection, message, session) {
	let notificationData = {
		from,
		targetCollection,
		sentDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
		message: _.pick(message, ["notification", "data"]),
	};
	let result, toIds;

	if (toRole == "company") {
		toIds = await CompanyLogin.findByUUID(message.tokens, {}, { _id: 1 });
	} else if (toRole == "staff") {
		toIds = await StaffLogin.findByUUID(message.tokens, {}, { _id: 1 });
	} else if (toRole == "customer") {
		toIds = await CustomerLogin.findByUUID(message.tokens, {}, { _id: 1 });
	}

	if (_.isEmpty(notificationData.targetCollection)) {
		delete notificationData.targetCollection;
	}

	await Notification.bulkWrite(
		toIds.map((toId) => ({
			insertOne: {
				document: {
					...notificationData,
					to: {
						role: toRole,
						id: toId._id,
					},
				},
			},
		})),
		{ session }
	);
}

async function storeNotificationGivenIds(from, toRole, toIdArray, targetCollection, message, session) {
	let notificationData = {
		from,
		targetCollection,
		sentDate: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
		message: _.pick(message, ["notification", "data"]),
	};

	if (_.isEmpty(notificationData.targetCollection)) {
		delete notificationData.targetCollection;
	}

	await Notification.bulkWrite(
		toIdArray.map((toId) => ({
			insertOne: {
				document: {
					...notificationData,
					to: {
						role: toRole,
						id: toId,
					},
				},
			},
		})),
		{ session }
	);
}

async function sendToAll(from, toRole, toIdArray, uuidArray, targetCollection, title, body, data, session) {
	const message = {
		notification: {
			title,
			body,
		},
		data,
		android: {
			notification: {
				icon: "",
				color: "#479bf5",
			},
		},
	};

	await storeNotificationGivenIds(from, toRole, toIdArray, targetCollection, message, session);
	/**
	 * Grouping receiver's id into group of 500 (max limit in fcm)
	 */
	if (uuidArray.length > 500) {
		let folds = 0;
		folds = uuidArray.length % 500;
		for (let i = 0; i < folds; i++) {
			let start = i * 500;
			let end = (i + 1) * 500;
			registrationTokens = uuidArray.slice(start, end);
			message["tokens"] = registrationTokens;
			sendNotifications(message);
		}
	} else {
		registrationTokens = uuidArray;
		message["tokens"] = registrationTokens;
		sendNotifications(message);
	}
}

exports.sendToAll = sendToAll;
exports.storeNotificationGivenIds = storeNotificationGivenIds;
