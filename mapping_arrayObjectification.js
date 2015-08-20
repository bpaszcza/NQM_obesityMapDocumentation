var fileOpen = require('./bin/fileopen'); //self made module for file opening/writing
var fs = require('fs');

var filePath = './data/schools_nonnormalised.json';
var newFilePath = './data/objSchools_nonnormalised_adjsutedforobjectification.json';

/***** Code to 'objectify' data.

The goal is to transcript all documents (i.e. all objects) from the collection (file) from an array to an object, with documents assigned under key (given by id), since it is easier to 'get' the individual objects (documents) for the website client from the server.

Initial state:
[
	{id: 100,
	.....},
	{id: 101,
	.....},
	{id: 102,
	.....}
]

Final state:
{
	100: {
		id: 100,
		.....
	},
	101: {
		id: 101,
		.....
	},
	102: {
		id: 102,
		.....
	}
}



8*****/

var fileFD;
var masterObject = {}; // new object containing all sub-objects
var keyName = "_id"; // SPECIFY THE KEY FIELD NAME

//load file
function loadFile (filePath) {
	console.log("start!");
	fileOpen.jsonFileOpen (filePath, function(parsedJSON, fd) {
		
		var fileArray = parsedJSON;
		fileFD = fd;	
		
		fs.close(fileFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("initial file closed");
			
			
			traverseArray (fileArray); //go over each document/object in the array
		});
	});
}

// append object to masterObject
function append (desiredKey, masterObject, singleObject){
	
	masterObject[desiredKey] = singleObject; //writing to the master object, under specified key
}

//save new file, exit.
function writeFile () {
	var stringified = JSON.stringify(masterObject);
	
	fs.writeFile(newFilePath, stringified, function (err) {
		if (err) {console.log(err)};
		console.log("finished");
	})
}

//go over each document/object in the array
function traverseArray (fileArray){
	// create new objects {} and append the old, individual object inside it, also specify the key

	for (var i = 0; i < fileArray.length; i++){
		
		//get each array object, read msoaName, create key - value pair
		console.log("doing: "+fileArray[i][keyName]);//change with data type
		var desiredKey = fileArray[i][keyName];//change with data type
		var singleObject = fileArray[i];
		
		append (desiredKey, masterObject, singleObject);
		}
	writeFile();
}

loadFile (filePath);