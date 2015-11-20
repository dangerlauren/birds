var fs 				= require('fs');
var ejs 			= require('ejs');
var Bird      = require('./bird');
var geocoder  = require('geocoder');
var mongoose  = require('mongoose');

var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    accountUsername: String,
    birdId: String,
    // birdName: String,
    // birdImage: String,
    lat: String,
    lng: String
});

var Sighting = mongoose.model('Sighting', sightingSchema);

var sighting = {

  Sighting: Sighting,

  expandUserBirds: function (userBirds, birdData){

  // console.log("userBirds:", userBirds); =>
  // userBirds:  [ {
  //   __v: 0,
  //   lng: '-97.9701846',
  //   lat: '30.18196499999999',
  //   birdId: '5625452ae4b0dbc5bd3644ad',
  //   accountUsername: 'sdeddens@gmail.com',
  //   _id: 564e5b1a10f7a8512a8ce61f
  //  }, {...}, ...]

    for (i=0; i<userBirds.length; i++){
      // populate each user sighting with birds name and image info using _id/birdId as the join metric.
      // there is an easer way to do this using mongoose populate method, but this works for now.
      for (j=0; j<birdData.length; j++){
        if (userBirds[i].birdId == birdData[j]._id) {
          // note: the "===" operator would fail here as mongo returns "_id" string as an Object!

          // note: the following puts the properies into userBirds but accessing them yields "undefined"!
          // userBirds[i].set("birdName", birdData[j].name, {strict: false});
          // userBirds[i].set("birdImage", birdData[j].images[0].url, {strict: false});

          // note: the following puts the properies into userBirds and they are accessable but they do not show up in object when logged!
          userBirds[i].birdName = birdData[j].name;
          userBirds[i].birdImage = birdData[j].images[0].url;
        };
      };
    };
    // console.log("userBirds:", userBirds); // =>
    // userBirds: [ {
    //   __v: 0,
    //   lng: '-97.9701846',
    //   lat: '30.18196499999999',
    //   birdId: '5625452ae4b0dbc5bd3644ad',
    //   accountUsername: 'sdeddens',
    //   _id: 564e5b1a10f7a8512a8ce61f,
    //   birdName: 'Redtail Hawk',  => not shown see note above
    //   birdImage: 'http://greglasley.com/images/RA/Red-tailed%20Hawk%200026.jpg'  => not shown see note above
    //  }, {...}, ...]
  },

  makeSighting : function (req, res) {
    geocoder.geocode(req.body.location, function ( err, data ) {
      if(!err){
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var newSighting = Sighting({
          accountUsername: req.user.username,
          birdId: req.body.birdId,
          lat: lat,
          lng: lng
        });
        newSighting.save(function(err){
          console.log("newSighting: ", newSighting);
          Bird.find({"_id": newSighting.birdId}, function(err, sightedBird){
          // if (err) console.log ("err: ", err);
          console.log("sightedBird :", sightedBird);
          // look up querys... and population
          newSighting.set("birdName", sightedBird[0].name, {strict: false});
          newSighting.set("birdImage", sightedBird[0].images[0].url, {strict: false});

          // the following two lines format a new sighting into display html populated with the sighting data
          var compiled = ejs.compile(fs.readFileSync(process.cwd() + '/views/partials/userBird.ejs', 'utf8'));
          var html = compiled({ bird: newSighting });

          // and the next line injects the html into the mongoose object thus enabling the html to piggy back on the object.
          newSighting.set("html", html, {strict: false});

          // send results back to client.
          res.json(newSighting);
          });
        });
      }
      else alert ("Location could not be found.");
    });
  },

  killSighting : function (req, res) {
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
  }

};

// Make this available to our other files
module.exports = sighting;
