var fs 				= require('fs');
var ejs 			= require('ejs');
var Bird      = require('./bird');
var geocoder  = require('geocoder');
var mongoose  = require('mongoose');

var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    accountUsername: String,
    birdId: String,
    lat: String,
    lng: String
});

var Sighting = mongoose.model('Sighting', sightingSchema);

var sighting = {

  Sighting: Sighting,

  expandUserBirds: function (userBirds, birdData){
/*  before...
* console.log("userBirds:", userBirds); =>
* userBirds:  [ {
*   __v: 0,
*   lng: '-97.9701846',
*   lat: '30.18196499999999',
*   birdId: '5625452ae4b0dbc5bd3644ad',
*   accountUsername: 'sdeddens@gmail.com',
*   _id: 564e5b1a10f7a8512a8ce61f
*  }, {...}, ...]
*/
      for (i=0; i<userBirds.length; i++){
      // populate each user sighting with birds name and image info using _id/birdId as the join metric.
      // there is an easer way to do this using mongoose populate method, but this works for now.
      for (j=0; j<birdData.length; j++){
        if (userBirds[i].birdId == birdData[j]._id) {
          // note: the "===" operator would fail here as mongo returns "_id" string as an Object!

          // note: the following puts the properies into userBirds but accessing them yields "undefined"!
          // however when sent via JSON they make it and the maps cans see them.
          userBirds[i].set("birdName", birdData[j].name, {strict: false});
          userBirds[i].set("birdImage", birdData[j].images[0].url, {strict: false});

          // note: the following puts the properies into userBirds and they are accessable but they do not show up in object when logged!
          // necessary if we are going to compile an ejs div!  Magic to me!?
          // when sent via json they do not make it;
          userBirds[i].birdName = birdData[j].name;
          userBirds[i].birdImage = birdData[j].images[0].url;
        };
      };
    };
/*  after...
*   console.log("userBirds:", userBirds); // =>
*   userBirds: [ {
*     __v: 0,
*     lng: '-97.9701846',
*     lat: '30.18196499999999',
*     birdId: '5625452ae4b0dbc5bd3644ad',
*     accountUsername: 'sdeddens',
*     _id: 564e5b1a10f7a8512a8ce61f,
*     birdName: 'Redtail Hawk',  => not shown see note above
*     birdImage: 'http://greglasley.com/images/RA/Red-tailed%20Hawk%200026.jpg'  => not shown see note above
*    }, {...}, ...]
*/
  },

  makeSighting : function (req, res) {
    geocoder.geocode(req.body.location, function ( anError, data ) {
      // console.log ("ERROR :", anError, "DATA : ", data);
      if (anError || data.status.valueOf() != 'OK') {
        res.json("error");
        return;
      };
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      var newSighting = Sighting({
        accountUsername: req.user.username,
        birdId: req.body.birdId,
        lat: lat,
        lng: lng
      });
      newSighting.save(function(anError){
        if (anError) console.log ("newSightingErr: ", anError);
/*        console.log("newSighting: ", newSighting);
*         newSighting:  { _id: 564f575c4c8423dc5c15450c,
*           lng: '-97.9701846',
*           lat: '30.18196499999999',
*           birdId: '5625452ae4b0dbc5bd3644ad',
*           accountUsername: 'sdeddens',
*           __v: 0 }
*/
        Bird.find({"_id": newSighting.birdId}, function(err, sightedBird){
        if (anError) console.log ("Bird.err: ", anError);
/*        console.log("sightedBird :", sightedBird);
*         sightedBird :
*            [ { images:
*            [ { url: 'http://greglasley.com/images/RA/Red-tailed%20Hawk%200026.jpg' },
*              { url: 'http://static1.1.sqspcdn.com/static/f/325017/14889235/1319999704153/red-tailed-hawk_681_600x4501.jpg?token=0WP1gfkQcukUNkisguTe0pdUhw4%3D' } ],
*           latin: 'Buteo jamaicensis',
*           name: 'Redtail Hawk',
*           _id: 5625452ae4b0dbc5bd3644ad } ]
*/
//        The following is totally crazy but it works and is required. Read the notes above!
//        look up querys... and population

        newSighting.birdName = sightedBird[0].name;
        newSighting.birdImage = sightedBird[0].images[0].url;
        newSighting.set("birdName", sightedBird[0].name, {strict: false});
        newSighting.set("birdImage", sightedBird[0].images[0].url, {strict: false});

        // the following two lines format a new sighting into display html populated with the sighting data
        var compiled = ejs.compile(fs.readFileSync(process.cwd() + '/views/partials/userBird.ejs', 'utf8'));
        var html = compiled({ sighting: newSighting });

        // and the next line injects the html into the mongoose object thus enabling the html to piggy back on the object.
        newSighting.set("html", html, {strict: false});

        // send results back to client.
        res.json(newSighting);
        });
      });
    });
  },

  killSighting : function (req, res) {
    Sighting.findByIdAndRemove(req.body.id, function (anError){
      if (anError) {
        // console.log ("kill_sighting error:", anError);
        res.json({"killed": false})
      }
      else {
        res.json({"killed": true})
      }
    });
  }

};

// Make this available to our other files
module.exports = sighting;
