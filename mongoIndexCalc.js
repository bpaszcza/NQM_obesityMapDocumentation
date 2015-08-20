var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
var fileOpen = require('./bin/fileopen');

/**** Javascript to calculate 'school index' of the number and proximity of fastfoods & convenience stores (separately) around each individual school. 

The index is formed as a sum of inverse of the distances between school and food store.

Analogous index is created for convenience stores.


IMPORTANT NOTE: normalisation doesn't work, unfortunately
*****/


var cursorIndex = 0;

var dbName = 'mydb';
var schoolColName = 'schools';

var url = String('mongodb://127.0.0.1:27017/' + dbName); 

// iteration over each school document in collection

function loop(callback) {

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);

        var schoolCursor = db.collection(schoolColName).find( /*{"index": {$exists: false}}*//*{$or: [ {_id: "100000"}, {_id: "100009"} ] }*/ );

        schoolCursor.count(function (err, counter) {
			console.log("Number of documents to be done: "+counter);

            schoolCursor.each(function (err, document) {
                assert.equal(err, null);

                if (document != null /*&& document.nearby_fastfoods != null && document.nearby_stores != null*/) {
					
					
					var indexNearbyFFCursor = document.nearby_fastfoods; //arrays of all nearby fastfoods (see mongoNearbyQuery.js)
					var nearbyStoresCursor = document.nearby_stores; // analogously - nearby stores
					
					
					var listIndex = Number(document._id);

                    calcIndex(db, indexNearbyFFCursor, nearbyStoresCursor, listIndex, function (locArray) {
                        
                            db.collection(schoolColName).update({ //updating document in mongoDB with the received index
                                "_id": String(listIndex) }, 
								{
                                $set: {
                                    "index": locArray
                                }
                            }, function (err, record) {
                                console.log("Index calculation for school no " + listIndex + " has been done. Cursor index: "+cursorIndex);
								
								cursorIndex++;

                                if (cursorIndex >= counter - 2) {
                                    setTimeout(finish(db), 5000); //if normalisation needed, set 'finish(db)' -> 'normalisation(db)'
                                }
                            });
                        });
                } else {
					if (cursorIndex >= counter - 2) {
									console.log("Index has been normalised (max value = 1)")
                                    setTimeout(finish(db), 5000); //if normalisation needed, set 'finish(db)' -> 'normalisation(db)'
					}
				}
            });
        });
    });
}


// calcIndex -> submits calculated index into the result key
var calcIndex = function(db, aNearbyFF, aNearbyStores, listIndex, callback) {
	
	var results = {};
	var indexFF = 0; 
	var indexStores = 0;
	
	// for Fast Food restaurants
	
	if(aNearbyFF !== [] && aNearbyFF) {
	for (var indexNearbyFF = 0; indexNearbyFF < aNearbyFF.length; indexNearbyFF++) {
		var doc = aNearbyFF[indexNearbyFF];
		var dist = doc.geoCode.mDistance2school; // distance calculated using mongoNearbyQuery.js
		
		if(dist < 1000){
			indexFF = indexFF + (1/dist); // inverse distance function
		}
		
	}
	}
	
	// for Convenience Stores
	
	if(aNearbyStores !== [] && aNearbyStores){
	for (var indexNearbyStores = 0; indexNearbyStores < aNearbyStores.length; indexNearbyStores++) {
		var doc2 = aNearbyStores[indexNearbyStores];
		var dist2 = doc2.geoCode.mDistance2school;
		
		if(dist2 < 1000){
			indexStores = indexStores + (1/dist2);
		}
	}
	}
	
	results.fastfoods = indexFF;
	results.stores = indexStores;
	results.status = "not normalised, limit 1km"
	
	callback(results);
}


/* the normalise function is NOT WORKING (yet...) */

/*function normalise(db) {
	// obtain maximum
	var oMaxFF = db.collection(schoolColName).find().sort({"index.fastfoods":-1}).limit(5);
	var oMaxStores = db.collection(schoolColName).find().sort({"index.stores":-1}).limit(5);
	// scale all entries
	var aMaxFF = oMaxFF.toArray();
	var aMaxStores = oMaxStores.toArray();
	
	console.log(aMaxFF);
	
	var ffMax = aMaxFF[0].index.fastfoods;
	var storeMax = aMaxStores[0].index.fastfoods;
	
	var ffRatio = (1/ffMax);
	var storeRatio = (1/storeMax);
	
	var schoolCursor = db.collection(schoolColName).find();
	
	        schoolCursor.count(function (err, counter) {
			console.log("Number of documents to be done: "+counter);

            schoolCursor.each(function (err, document) {
                assert.equal(err, null);

                if (document != null && document.index.fastfoods != null && document.index.stores != null) {
					
					var listIndex = Number(document._id);
					var newFFIndex = Number(document.index.fastfoods)*ffRatio;
					var newStoresIndex = Number(document.index.stores)*storeRatio;

                    db.collection(schoolColName).update({
                                "_id": String(listIndex) }, 
								{
                                $set: {
                                    "index.fastfoods": newFFIndex,
									"index.stores": newStoresIndex
                                }
						}, function (err, record) {
                                console.log("Index calculation for school no " + listIndex + " has been done. Cursor index: "+cursorIndex);
								console.log(locArray);
								cursorIndex++;

                                if (cursorIndex >= counter - 2) {
									console.log("Index has been normalised (max value = 1)")
                                    setTimeout(finish(db), 5000);
                                };
                            });
                } else {
					if (cursorIndex >= counter - 2) {
									console.log("Index has been normalised (max value = 1)")
                                    setTimeout(finish(db), 5000);
					}
				}
                });
            });
};*/

function finish (db) {
	db.close();
	console.log("finish");
}

loop(finish);



