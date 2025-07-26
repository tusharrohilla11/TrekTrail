if(process.env.NODE_ENV != "production"){ 
    // this means if we are not in production rn, do this 
    // there is a different way to deal with env variables in production
    require('dotenv').config()
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); 
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); // used for different HTTP verbs
const passport = require('passport'); // it doesnt uses bcrypt, instead it uses Pbkdf2
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users'); // All user routes are present in this file
const trekRoutes = require('./routes/treks'); // All trek routes are present in this file
const reviewRoutes = require('./routes/reviews'); // All review routes are present in this file

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL ;
mongoose.connect(dbUrl);
// console.log(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", ()=>{
    console.log("Database Connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.secret || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});


const sessionConfig = {
    store,
    name: 'sessionconnection',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig)); // this must come before passport.session()
app.use(flash());
// app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;  // these all are stored for a single req, res cycle
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes); 
app.use('/treks', trekRoutes);
app.use('/treks/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    // only requests which do not match any of the specifies routes will come here
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong';
    res.status(statusCode).render('error', {err});
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on Port ${port}`);
});