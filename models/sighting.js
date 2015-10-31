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

Sighting = mongoose.model('Sighting', sightingSchema);

function makeSighting(req, res) {
  geocoder.geocode(req.body.location, function ( err, data ) {
    if(!err){
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      var newSighting = Sighting({
        accountUsername: req.user.username,
        birdId: req.body.birdId,
        // birdName: req.body.title,
        // birdImage: req.body.birdImage,
        lat: lat,
        lng: lng
      });
      console.log("geocode:");
      newSighting.save(function(err){
        Bird.find({"_id": newSighting[0].birdId}, function(err, sightedBird){
          console.log("newBird",sightedBird);
          console.log("newsight",newSighting);
          if(err) console.log("err:", err);
          newSighting[0].set("birdName",sightedBird[0].name, {strict: false});
          newSighting[0].set("birdImage",sightedBird[0].images[0].url, {strict: false});


          // the following two lines format a new sighting into display html populated with the sighting data
          var compiled = ejs.compile(fs.readFileSync(process.cwd() + '/views/partials/userBird.ejs', 'utf8'));
          var html = compiled({ bird:newSighting });

          // and the next line injects the html into the mongoose object thus enabling the html to piggy back on the object.
          newSighting.set("html", html, {strict: false});

          // send results back to client.
          res.json(newSighting);
        });
      });
    }
    else {
      alert ("Location could not be found.");
    };
  });
};

function killSighting(req, res) {
  Sighting.findByIdAndRemove(req.body.id, function (err){
    console.log("err:",err);
    res.json({"killed": true})
    // if (err) {
    //   console.log ("kill_sighting err:", err);
    //   res.json({"killed": false})
    // }
    // else {
    //   res.json({"killed": true})
    // }
  });
};

// Make this available to our other files
module.exports.Sighting = Sighting;
module.exports.makeSighting = makeSighting;
module.exports.killSighting = killSighting;
