const express = require('express');
const router = express.Router();
const {SubscriptionController} = require('../controllers/subscriptionController');
const catchAsync = require('../error/catchAsync');

const subscriptionController = new SubscriptionController();

router.post('/subscriptions',catchAsync( subscriptionController.createNewSubscription ));
router.get('/subscriptions/customer/:id',catchAsync( subscriptionController.getAllSubscription));
router.get('/subscriptions/company/:id',catchAsync( subscriptionController.getAllSubscriber));
router.delete('/subscriptions/:id',catchAsync( subscriptionController.deleteSubscriptionById));
module.exports = router;
//use customer and company api to get more detail by respective id