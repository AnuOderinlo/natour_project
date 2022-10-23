const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

/**Param middleware to check a valid ID, check the tour controller for implementation */
// router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
