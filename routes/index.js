var express = require('express');
var router = express.Router();

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



module.exports = router;
