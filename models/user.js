// User model w/ Mongoose
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String
});

var User = mongoose.model('User', userSchema);

// Make this available to our other files
module.exports = User;