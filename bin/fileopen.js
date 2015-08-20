var fs = require('fs');
var jsonfile = require('jsonfile');

exports.jsonFileOpen = function (pathToFile, callback) {
	
	fs.open(pathToFile, 'r+', function(err, fd) {
		if (err) {
			throw 'error opening file: ' + err;
		}
		var outputFD = fd;
		fs.readFile ( pathToFile, function fileReading  (err, dataset) {
        if (err){
            return console.log(err);
        } else {
			var temp = dataset.toString();
			var string = JSON.parse(temp);
			//console.log(string);
			
			console.log("json read and parsed");
			callback(string, outputFD);
        }
		});
	});
}

/*exports.jsonFileOpen2 = function (pathToFile, callback) {
	
	fs.open(pathToFile, 'r+', function(err, fd) {
		if (err) {
			throw 'error opening file: ' + err;
		}
		var outputFD = fd;
		fs.readFile ( pathToFile, function fileReading  (err, dataset) {
        if (err){
            return console.log(err);
        } else {
			console.log(dataset);
			
			var string = dataset.toString();
			console.log(typeof string);
			//console.log(string);
			var string2 = JSON.parse(string);
			console.log("json read and parsed");
			callback(string, outputFD);
        }
		});
	});
}*/

// NOTE CHANGED: PROVIDE FILEPATH

exports.jsonFileWrite = function (jsonArray, outputFD, filePath) {
	
	jsonfile.writeFile(filePath, jsonArray, {spaces: 4}, function(err) {
		if (err) {console.log (err);}
		
		fs.close(outputFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("Dataset was logged to the JSON file");
        });
		
	});
}


exports.jsonFileWriteIntermediate = function (jsonArray, pathToFile, outputFD) {
	//Note: this function doesn't close the file!
	
	jsonfile.writeFile(pathToFile, jsonArray, {spaces: 4}, function(err) {
		if (err) {console.log (err);}
		
		console.log("jsonfile updated");
	});
}

