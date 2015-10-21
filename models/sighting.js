var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    accountUsername: String,
    birdName: String 
});

// Make this available to our other files
module.exports = mongoose.model('Sighting', sightingSchema);