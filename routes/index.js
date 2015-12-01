var express   = require('express');
var passport  = require('passport');
var Account   = require('../models/account');
var Bird      = require('../models/bird');
var sighting  = require('../models/sighting');
var router    = express.Router();
var validator = require('validator');
var paginate  = require('express-paginate');
var util      = require('util'); // for debugging only


router.get('/', function (req, res) {
  if(!req.user) {
    res.render('index', {title: 'What the Duck?'});
    return false;
  };
  // prepair to render the user home page: find all the birds
  Bird.find({}, function(err, birdData){
    // find all the users sightings
    sighting.Sighting.find({accountUsername: req.user.username}, function(err, userBirds){
      sighting.expandUserBirds(userBirds, birdData);
      res.render('index', {
        user : req.user,
        title: 'What the Duck?',
        birds: birdData,
        userBirds: userBirds,
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

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

router.post('/newSighting', function(req, res) {
  sighting.makeSighting(req, res);
});

router.post('/killSighting', function(req, res) {
  sighting.killSighting(req, res);
});

router.get('/about', function(req, res){
  res.render('about');
});

module.exports = router;
