const Review = require('../models/review'); 
const Trek = require('../models/trek'); 

module.exports.createReview = async(req, res) => {
    const trek = await Trek.findById(req.params.id);
    const review = new Review(req.body.review); // because names are of types review[body] and review[rating]
    review.author = req.user._id;
    trek.reviews.push(review);
    await review.save();
    await trek.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/treks/${trek._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params
    await Trek.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // IT WILL REMOVE REVIEW WITH reviewId from reviews ARRAY
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/treks/${id}`);
};

module.exports.viewReview = (req, res)=>{ // this was created to handle a problem which occured when we tried to delete a review without authentication
    const {id} = req.params;
    res.redirect(`/treks/${id}`);
};