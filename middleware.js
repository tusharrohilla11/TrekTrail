const {trekSchema, reviewSchema} = require('./schemas.js'); // AS OF NOW IT IMPORTS SCHEMA FOR VALIDATION THROUGH JOI
const ExpressError = require('./utils/ExpressError');
const Trek = require('./models/trek');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user); // this user is automatically added to req by passport
    if(!req.isAuthenticated()){ // this isAuthenticated function is automatically added to req by passport
        // store the url they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateTrek = (req, res, next) => {
    const {error} = trekSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    }
    else{
        next(); // WE HAVE TO CALL NEXT AS IT IS A MIDDLEWARE
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const trek = await Trek.findById(id);
    if(!trek.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/treks/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    }
    else{
        next(); // WE HAVE TO CALL NEXT AS IT IS A MIDDLEWARE
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} =  req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/treks/${id}`);
    }
    next();
}