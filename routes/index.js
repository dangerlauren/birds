var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Bird = require('../models/bird');
var Sighting = require('../models/sighting').Sighting;
var makeSighting = require('../models/sighting').makeSighting;
var killSighting = require('../models/sighting').killSighting;
var router = express.Router();
var validator = require('validator');
var paginate = require('express-paginate');

router.get('/', function (req, res) {
  if(!req.user) {
    res.render('index', {title: 'What the Duck?'});
    return false;
  };

  // find all the birds
  Bird.find({}, function(err, birdData){
    // find all the users sightings
    Sighting.find({accountUsername: req.user.username}, function(err, userBirds){
      // populate each user sighting with birds name and image info using _id/birdId as the join metric.
      for (i=0; i<userBirds.length; i++){
        for (j=0; j<birdData.length; j++){
          if (userBirds[i].birdId == birdData[j]._id) {
            // note: the "===" operator would fail here as mongo returns "_id" string as an Object!
            userBirds[i].set("birdName", birdData[j].name, {strict: false});
            userBirds[i].set("birdImage", birdData[j].images[0].url, {strict: false});
            break;
          };
        };
      };
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
  makeSighting(req, res);
});

router.post('/killSighting', function(req, res) {
  killSighting(req, res);
});

router.get('/about', function(req, res){
  res.render('about');
});

module.exports = router;
