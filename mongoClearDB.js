var url = 'mongodb://127.0.0.1:27017/mydb';
var dbName = 'mydb';




function clearDB (url, dbName) {
    var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;    

    MongoClient.connect(url, function(err, db) {
        if(err) throw err;
        collection.drop('test2');
        });
    };
}

clearDB (url, dbName);

