var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    user_id: { type: String, required: true },
    bird_id: { type: String, required: true },
});

var Sighting = mongoose.model('Sighting', sightingSchema);

// Make this available to our other files
module.exports = Sighting;