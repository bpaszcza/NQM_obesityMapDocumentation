//var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
var fileOpen = require('./bin/fileopen'); //self-written module for opening/closing file
var geolib = require('geolib'); //needed to calculate distance between two LatLong points

/*****
 This javascript is aiming to search for geocoded objects (with LatLong coordinates) around a specified (with Latitude and Longitude) point (named 'school', but could be anything really).
*
*Note: needs adjustment for used schema in a few places probably (here: 'schools' used doc.coordinates.(lat/lng) while the objects searched used doc.coordinates.geoCode.(lat/lng))

geolib is used to calculate distance between the point found and 'school'

DELTA is the 'tolerance' in search - how far away from the school can a point be found. NOTE: it is in LatLong format (hence 0.02 translates to around 2.2 km)
*/

var cursorIndex = 0;

var dbName = 'mydb'; //mongoDB name
var schoolColName = 'schools'; // name of School's collection
var fastfColName = 'fastfoods'; // name of collection of the objects we want to search for nearby schools

var delta = 0.02; // around 2.2km north and south and (hopefully) similar distance to the left and right

var url = String('mongodb://127.0.0.1:27017/' + dbName); 

// read mongo doc (from schools)

function loop(callback) {

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);

        var schoolCursor = db.collection(schoolColName).find( /*{"nearby_fastfoods": []}*//*{$or: [ {_id: "100000"}, {_id: "100009"} ] }*/ );

        schoolCursor.count(function (err, counter) { //counts number of documents in cursor
			console.log("Number of documents to be done: "+counter);

            schoolCursor.each(function (err, document) { //forEach document...
                assert.equal(err, null);

                if (document != null) {
					
					var listIndex = Number(document._id);
                    
                    var lat = document.coordinates.lat;
                    var lng = document.coordinates.lng;

                    findNearby(db, lat, lng, listIndex, function (locArray) {
							
							if (locArray === []) {
								console.log("CHECK: no results found for entry: " + listIndex);
							}

                            db.collection(schoolColName).update(
								{
                                "_id": String(listIndex) }, 
								{
                                $set: {
                                    "nearby_fastfoods": locArray
                                }
                            }, function (err, record) {
                                console.log("Entry of school no " + listIndex + " has been updated. Cursor index: "+cursorIndex);
								cursorIndex++;

                                if (cursorIndex >= counter - 2) {
                                    setTimeout(finish(db), 5000);
                                }
                            });
                        });
                }
            });
        });
    });
}



// findNearby -> array of results
var findNearby = function(db, lat, lng, listIndex, callback) {
	
	var locArray = [];
	
	var latLower = lat - delta;
	var latUpper = lat + delta;
	var lngLower = lng - delta;
	var lngUpper = lng + delta;
	
	
	var cursor = db.collection(fastfColName).find( {  $and: [ { "coordinates.geoCode.lat": { $gt: latLower, $lt: latUpper } }, { "coordinates.geoCode.lng": { $gt: lngLower, $lt: lngUpper } } ] }, {_id: 1, "coordinates.geoCode": 1}).sort( {"coordinates.geoCode.lat": 1, "coordinates.geoCode.lng": 1});
	//this find() searches for objects within the given position (of school) +- delta, in both lat and long. Sorts results by ascending latitude, then longitude
   
   var indexLocArray = 0;
   
   cursor.each( function(err, doc) {
      assert.equal(err, null);
	  
      if (doc != null) {
		  
		  var newObject = {};
		  var dist = geolib.getDistance (
			{latitude: lat, longitude: lng},
			{latitude: doc.coordinates.geoCode.lat, longitude: doc.coordinates.geoCode.lng}
			); // distance calculation between school and the newly found object (fastfood/store/etc.)
		  
		  newObject._id = doc._id;
		  newObject.type = fastfColName;
		  newObject.geoCode = {};
		  newObject.geoCode.lat = doc.coordinates.geoCode.lat;
		  newObject.geoCode.lng = doc.coordinates.geoCode.lng;
		  newObject.geoCode.mDistance2school = dist;
		  
		  locArray[indexLocArray] = newObject;
		  
		  indexLocArray++;

		} else {
			callback(locArray);
      }
   });
};

function finish (db) { //unsurprisingly, the finally called function
	db.close();
	console.log("job done");
}

loop(finish);



