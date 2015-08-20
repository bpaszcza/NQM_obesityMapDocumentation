var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
var fileOpen = require('./bin/fileopen');

var dbName = 'mydb';
var collectionName = 'schools';
var pathToFile = './tempdata/schools_20150709_sanitised.json';

var url = String('mongodb://127.0.0.1:27017/' + dbName); 

var database;
var singleEntry = [];


function jsonParsing (callback) {
	console.log(url);
	console.log("");
    fs.readFile ( pathToFile, function fileReading  (err, dataset) {
        if (err){
            return console.log(err);
        } else {
			
			var string = dataset.toString();
			singleEntry = JSON.parse(string);
			console.log("JSON parsed, begin uploading...");
			callback();
        }
    });
}

function dbConnect (parsedJSON) {
	singleEntry = parsedJSON;
	
	MongoClient.connect(url, function(err, db) {
		
		if(err) throw err;
		console.log("Connected to server");
		
		insertDocument(db, singleEntry, function() {
			console.log("Collection "+collectionName+" was uploaded to database " + dbName);
			db.close();
		});	
	});
}

var insertDocument = function(db, singleEntry, callback) {
	
	var batch = db.collection(collectionName).initializeUnorderedBulkOp({useLegacyOps: true});
	
	for (var i = 0; i < singleEntry.length; i++){
	
		batch.insert(singleEntry[i]);
	}
	batch.execute(function (err, r) {
		console.log("Inserted a document into the "+ collectionName +" collection.");
		callback(r);
	});    
}

fileOpen.jsonFileOpen(pathToFile, dbConnect);

	