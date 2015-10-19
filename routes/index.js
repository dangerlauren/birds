var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var User   = require('../models/user'); // get our mongoose model

var Bird = require('../models/bird');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	Bird.find({name: "Cardinal"}, function(err, bird) {
		if(err) console.log(err);
		console.log(bird);
		res.render('index', { title: 'What the Duck?' });
	});

  
});

router.get('/setup', function(req, res) {

  // create a sample user
  var john = new User({
    name: 'John Doe',
    password: 'myawesomepassword',
    admin: true
  });

  // save the sample user
  john.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

router.post('/authenticate', function(req, res) {

  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    }
    else if (user) {

      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (!result) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        }
        else {
          // if user is found and password is right
          // create a token
          var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440 // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      });

    }
  });

});

module.exports = router;

