var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Bird = require('../models/bird');
var Sighting = require('../models/sighting');
var router = express.Router();
var validator = require('validator');


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
                    bird: birddata,
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

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/map', function(req, res) {
    res.render('map', { user : req.user });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


router.post('/newSighting', function(req, res) {
    var newSighting = Sighting({
        accountUsername: req.user.username,
        birdName: req.body.title,
        birdImage: req.body.birdImage
    });

    newSighting.save(function(err){

        if(err) console.log(err);
        res.render('index');
    });
});

module.exports = router;
