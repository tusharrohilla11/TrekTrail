const Trek = require('../models/trek'); 
const {cloudinary} = require("../cloudinary");
const opencage = require('opencage-api-client');
const geojson = require('geojson');

module.exports.index = async (req, res) => {
    const treks = await Trek.find({});
    res.render('treks/index', {treks});
};

module.exports.renderNewForm = (req, res) => {
    res.render('treks/new');
};

module.exports.createTrek = async (req, res, next) => {
    const coord = await opencage.geocode({ q: req.body.trek.location });
    const geoData = geojson.parse(coord.results, { Point: ['geometry.lat', 'geometry.lng'] });
    // res.send(geoData.features[0].geometry);
    // if(!req.body.trek) throw new ExpressError('Invalid trek Data', 400);
    const trek = new Trek(req.body.trek);
    trek.geometry = geoData.features[0].geometry;
    trek.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    trek.author = req.user._id;
    // console.log(trek);
    await trek.save();
    req.flash('success', 'Successfully made a new trek!');
    res.redirect(`/treks/${trek._id}`);
};

module.exports.showTrek = async (req, res) => {
    const {id} = req.params;
    const trek = await Trek.findById(id).populate({
        path: 'reviews', // this is to populate all reviews
        populate: {
            path: 'author'  // this is to populate author of reviews
        }
    }).populate('author'); // this is to populate author of treks
    if(!trek){ 
        req.flash('error', 'Cannot find that trek!');
        return res.redirect('/treks');
    }
    res.render('treks/show', {trek});
};

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const trek = await Trek.findById(id);
    if(!trek){
        req.flash('error', 'Cannot find that trek!');
        return res.redirect('/treks');
    }
    res.render('treks/edit', {trek});
};

module.exports.updateTrek = async (req, res) => {
    const {id} = req.params;
    const trek = await Trek.findByIdAndUpdate(id, {...req.body.trek});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    trek.images.push(...imgs);
    await trek.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await trek.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } } );
        console.log(trek);
    }
    req.flash('success', 'Successfully updated trek!');
    res.redirect(`/treks/${trek._id}`);
};

module.exports.deleteTrek = async (req, res) => {
    const {id} = req.params;
    // I CANT DELETE WITH ANY OTHER METHOD AS IT IS ASSOCIATED WITH MONGO MIDDLEWARE WHICH WE USED FOR DELETE CASCADING
    await Trek.findByIdAndDelete(id); 
    req.flash('success', 'Successfully deleted trek!');
    res.redirect('/treks');
};