var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://127.0.0.1:27017/mydb';
	
MongoClient.connect(url, function(err, db) {
		if(err) throw err;
		console.log("Connected to server");
		
		db.collections (function (err, collections2) {
			console.log(collections2);
			db.close();
		})
		
});
