const express = require('express');
const router = express.Router();
const {SubscriptionController} = require('../controllers/subscriptionController');
const catchAsync = require('../error/catchAsync');

router.post('/subscriptions',catchAsync( new SubscriptionController().createNewSubscription ));
router.get('/subscriptions/customer/:id',catchAsync( new SubscriptionController().getAllSubscription));
router.get('/subscriptions/company/:id',catchAsync( new SubscriptionController().getAllSubscriber));
router.delete('/subscriptions/:id',catchAsync( new SubscriptionController().deleteSubscriptionById));
module.exports = router;
//use customer and company api to get more detail by respective id