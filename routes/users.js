var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// var userSchema = new Schema({
//     name: String,
//     email: String,
//     password: String,
// });

// userSchema.pre('save', function(next) {
//   var user = this;

//   // only hash the password if it has been modified (or is new)
//   if (!user.isModified('password')) return next();

//   // generate a salt
//   bcrypt.genSalt(10, function(err, salt) {
//     if (err) return next(err);

//     // hash the password along with our new salt
//     bcrypt.hash(user.password, salt, function(err, hash) {
//       if (err) return next(err);

//       // override the cleartext password with the hashed one
//       user.password = hash;
//       next();
//     });
//   });
// });

// set up a mongoose model and pass it using module.exports
// module.exports = mongoose.model('User', userSchema);
module.exports = router;