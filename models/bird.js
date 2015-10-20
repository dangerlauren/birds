// Dog model w/ Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var birdSchema = new Schema({
    name: { type: String, required: true },
    latin: { type: String, required: true },
    images: { type: String, required: true }
});

var Bird = mongoose.model('Bird', birdSchema);

// Make this available to our other files
module.exports = Bird;