const express = require('express');
const router = express.Router();
const {WorkController} = require('../controllers/workController');
const catchAsync = require('../error/catchAsync');

router.post('/companies/works',catchAsync( new WorkController().createNewWork));//id not used
router.get('/:role/works',catchAsync( new WorkController().getAllWork));//role:company, staff body:id of company, idArray of staff_group
router.get('/works/:id',catchAsync( new WorkController().getWorkById));
router.put('/works/:id',catchAsync( new WorkController().updateWorkById));
router.delete('/works/:id',catchAsync( new WorkController().deleteWorkById));
module.exports = router;