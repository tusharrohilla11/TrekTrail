const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register'); // users folder in views folder
};

module.exports.register = async (req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to TrackMyTrek!');
            res.redirect('/treks');
        })
    }
    catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login'); // users folder in views folder
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/treks';
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(function(err) {
        if(err){
            return next(err);
        }
        req.flash('success', "Good Bye!")
        res.redirect('/treks');
    });
};
