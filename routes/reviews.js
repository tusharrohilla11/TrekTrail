const express = require('express');
const router = express.Router({mergeParams: true}); // this is needed to merge the id from router prefix from app.js as express router tends to separate it
const {validateReview, isLoggedIn ,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review'); 
const Trek = require('../models/trek'); 

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

router.get('/:reviewId', reviews.viewReview);

module.exports = router;