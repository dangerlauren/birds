var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Bird = require('../models/bird');
var Sighting = require('../models/sighting');
var router = express.Router();
var validator = require('validator');
var fs = require('fs');
var ejs = require('ejs');
var geocoder = require('geocoder');
var paginate = require('express-paginate');


router.get('/', function (req, res) {
  if(!req.user) {
    res.render('index', {title: 'What the Duck?'});
    return false;
  }

  Bird.find({}, function(err, birddata){
    Sighting.find({accountUsername: req.user.username}, function(err, stuff){
      res.render('index', {
        user : req.user,
        title: 'What the Duck?',
        birds: birddata,
        userBirds: stuff,
      });
    });
  });
});


router.get('/register', function(req, res) {
  res.render('register', {
   username: "",
   error: ""
 });
});

router.post('/register', function(req, res) {
  var val = validator.isEmail(req.body.username);

  if (val) {

    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
      if (err) {
        return res.render('register', { account : account, error: err, username: req.body.username });
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      });
    });
  }

  else {

    res.render('register', {
     username: req.body.username,
     error: "Please enter a valid email"
    });
  }
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login',
  passport.authenticate('local',
    {failureRedirect: '/login' }),
  function(req, res) { res.redirect('/') }
  );

// <<<<<<< HEAD
// router.get('/map', function(req, res) {
//   res.render('map', { user : req.user });
// });

// =======
// >>>>>>> master
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});


router.post('/newSighting', function(req, res) {

    geocoder.geocode(req.body.location, function ( err, data ) {
        if(!err){
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var newSighting = Sighting({
                accountUsername: req.user.username,
                birdName: req.body.title,
                birdImage: req.body.birdImage,
                lat: lat,
                lng: lng
            });
            newSighting.save(function(err){
                if(err) console.log("err:", err);

                // the following two lines format a new sighting into display html populated with the sighting data
                var compiled = ejs.compile(fs.readFileSync(process.cwd() + '/views/partials/userBird.ejs', 'utf8'));
                var html = compiled({ bird:newSighting });
                // and the next line injects the html into the mongoose object thus enabling the html to piggy back on the object.
                newSighting.set("html",html, {strict: false});

                res.json(newSighting);
            });
        }
        else {
          alert ("Location could not be found.")
        };
    });
});

router.get('/about', function(req, res){
res.render('about');

});

module.exports = router;
