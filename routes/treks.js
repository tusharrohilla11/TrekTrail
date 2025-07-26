const express = require('express');
const router = express.Router();
const treks = require('../controllers/treks');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateTrek} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary'); // we dont need to do /index as node automatically looks up for index.js files
const upload = multer({ storage });

const Trek = require('../models/trek'); 

router.route('/')
    .get(catchAsync(treks.index))
    .post(isLoggedIn, upload.array('image'), validateTrek, catchAsync(treks.createTrek));
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send("hi");
    // })
    
router.get('/new', isLoggedIn, treks.renderNewForm);

router.route('/:id')
    .get(catchAsync(treks.showTrek))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateTrek, catchAsync(treks.updateTrek))
    .delete(isLoggedIn, isAuthor, catchAsync(treks.deleteTrek));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(treks.renderEditForm));


module.exports = router;