var fs 				= require('fs');
var ejs 			= require('ejs');
var geocoder 	= require('geocoder');
var mongoose 	= require('mongoose');

var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    accountUsername: String,
    birdId: String,
    birdName: String,
    birdImage: String,
    lat: String,
    lng: String
});

function saveSighting(req, res) {

    geocoder.geocode(req.body.location, function ( err, data ) {
        if(!err){
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var newSighting = Sighting({
                accountUsername: req.user.username,
                birdName: req.body.title,
                birdImage: req.body.birdImage,
                lat: lat,
                lng: lng
            });
            console.log("geocode:");
            newSighting.save(function(err){
                if(err) console.log("err:", err);

                // the following two lines format a new sighting into display html populated with the sighting data
                var compiled = ejs.compile(fs.readFileSync(process.cwd() + '/views/partials/userBird.ejs', 'utf8'));
                var html = compiled({ bird:newSighting });
                // and the next line injects the html into the mongoose object thus enabling the html to piggy back on the object.
                newSighting.set("html",html, {strict: false});

                res.json(newSighting);
            });
        }
        else {
          alert ("Location could not be found.");
        };
    });
};


// Make this available to our other files
module.exports = mongoose.model('Sighting', sightingSchema);
module.exports = saveSighting;
module.exports = Sighting;
