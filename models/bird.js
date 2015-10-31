// Bird model w/ Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
		url: {type: String, required: true }
})

var birdSchema = new Schema({
    name: { type: String, required: true },
    latin: { type: String, required: true },
    images: [Image]
});

var Bird = mongoose.model('Bird', birdSchema);

// Make this available to our other files
module.exports = Bird;
