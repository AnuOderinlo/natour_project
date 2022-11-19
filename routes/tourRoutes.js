const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

/**Param middleware to check a valid ID, check the tour controller for implementation */
// router.param('id', tourController.checkId);
// .get(tourController.topTours, tourController.getAllTours)

router
  .route('/top-5-tours')
  .get(tourController.topTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/montly-plan/:year').get(tourController.getMontlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
