// dependencies
var bodyParser              = require('body-parser');
var cookieParser            = require('cookie-parser');
var express                 = require('express');
var favicon                 = require('serve-favicon');
var geocoder                = require('geocoder');
var LocalStrategy           = require('passport-local').Strategy;
var logger                  = require('morgan');
var mongoose                = require('mongoose');
var path                    = require('path');
var passport                = require('passport');
var paginate                = require('express-paginate');
var validator               = require('validator');

var routes                  = require('./routes/index');
var users                   = require('./routes/users');

var app                     = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// app.use(express_geocoding_api({
//     geocoder: {
//         provider: 'google'
//     }
// }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
// for production comment out following line:
mongoose.connect(process.env.MONGO_DB_BIRDS);
// and fill in the logon string from .bash_profile MONGO_DB_BIRDS environment variable.
// mongoose.connect("mongodb://...longon credentials go here... ");
// ALSO, IMPORTANT.. MODIFY package.json line 6 to read:
//     "start" : "NODE_ENV=production node ./bin/www"

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
