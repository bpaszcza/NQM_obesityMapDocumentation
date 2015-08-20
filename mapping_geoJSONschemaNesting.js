var fileOpen = require('./bin/fileopen'); //self made module for file opening/writing
var fs = require('fs');

var assert = require('assert');

/***** Code to create a 'nested' geoJSON


Here, it means assigning all MSOAs to an single LA object (under the Local Authority's ID key), 
and then appending all LA objects into a single object spanning the whole file.

Nested geoJSON is needed for maps with 'two data layers', here: by clicking on a given LA, map is zoomed in and displays all MSOAs inside that LA.

a dictionary is needed (see createLAdictionary.js).

{
	"E09000001":{
		"type":"FeatureCollection",
		"features":[{
			"type":"Feature",
			"properties":{
				"MSOA11CD":"E02000001",
				"MSOA11NM":"City of London 001",
				"MSOA11NMW":"City of London 001"},
				"geometry":{
					"type":"MultiPolygon",
					"coordinates":[..........]
				}
			},
			{other MSOA, using the template above},
			{one more MSOA}]
	},
	,"E09000002":{
		.......
	},
	,"E09000003":{
		
	}
}


8*****/


var dictionaryPath = './data/lookupLADtoMSOA_with_schools.json';
var geoJSONPath = './data/geoMSOA_array.json'; //note: this needs to be an array, not an object!
var newFilePath = './data/geoMSOA_onested.json'; //OUTPUT FILE

var msoaArray = []; //contains all geoJSON objects for MSOAs
var dictArray = [];
var dictObj = {};
var newObject = {};


// function to load dictionary, where for each LA key, under 'msoa' key, there is an array of 
// MSOA codes that belong to given LA
function loadDictionary (dictionaryPath) {
	console.log("a");
	fileOpen.jsonFileOpen (dictionaryPath, function(parsedJSON, fd) {
		
		dictObj = parsedJSON;
		var dictFD = fd;
		
		dictArray = Object.keys(dictObj);	
		
		fs.close(dictFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("dictionary file closed");
			loadMSOA (geoJSONPath); //calling function to load geoJSON
		});
	});
}

//function loading whole geoJSON to an array of MSOA's
function loadMSOA (geoJSONPath) {
	console.log("a");
	fileOpen.jsonFileOpen (geoJSONPath, function(parsedJSON, fd) {
		
		msoaArray = parsedJSON;
		var msoaFD = fd;
		
		fs.close(msoaFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("msoaClosed");
			eachLA(); //calling loop over each LA from dictionary
		});
	});
}

// function looping over whole dictionary array length, i.e. all Local Authorities keys
function eachLA (){

	for (var i = 0; i < dictArray.length; i++){
		console.log("i: "+dictArray[i]);
		var msoaCodeArray = dictObj[dictArray[i]].msoa; //obtains array of MSOA codes for a given LA
		var laCode = dictArray[i]; //local authority code
		var geometriesArray = []; //array for appending MSOA objects (will find itself under LAid.features)
		
		traverseAllMSOA ( msoaCodeArray, geometriesArray, laCode);
		}
	writeFile();
}

// Loop over all MSOAs in geoJSON (which is not effective at all...), finding and extracting entries for geoJSON
function traverseAllMSOA (msoaCodeArray, geometriesArray, laCode) {
	for (var a = 0; a < msoaArray.length; a++) {	
					
					if(msoaCodeArray){ // checking if the msoaCodeArray exists for a given LA
					
					var singleMSOAcd = msoaArray[a].properties.MSOA11CD;
				
					if(msoaCodeArray.indexOf(singleMSOAcd) > -1){ //if MSOA from geoJSON is on the list for the specified LA, then...
						
						var laMsoaName = msoaArray[a];
						geometriesArray.push(msoaArray[a]); //push to the results array
						
					} else {
						//console.log("not matched: " + msoaArray[a].properties.MSOA11NM);
					}
					}
		}
	console.log("getMSOAs done. Found: " + geometriesArray.length + " matching MSOAs.");
	if(geometriesArray != []){
		append(String(laCode), geometriesArray);	
	}
	
}


function writeFile () {
	// after looping through all Local Authorities, write to file and finish.
	var stringified = JSON.stringify(newObject);
	
	fs.writeFile(newFilePath, stringified, function (err) {
		if (err) {console.log(err)};
		
		console.log("finish");
		}
	})
}


function append (laCode, featuresArray){
	// creates the rest of the schema for a given LA (laCode), as seen in the example on top of this file
	newObject[laCode] = {};
	newObject[laCode]["type"] = "FeatureCollection";
	newObject[laCode].features = featuresArray; //appending the results (MSOAs geoJSONs)
	
}

function start (){
	loadDictionary(dictionaryPath);
}

start();