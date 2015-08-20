/*****

	Code to create the final version of LA dictionary, with arrays containing belonging school (step2) and MSOA (step1) id's.
	
	Step2: see 'mapping_createLADictionary_step2.js' !!!
	
SCHEMA:
{
	[laCode]: {
		LAname:
		msoa: [array of msoa id's]
		schools: [id list,,,,]
	}
	[laCode]: {
		.....
	}
}
*/

var pathToInput = './data/lookupLADtoMSOA.json';
var pathToSchools = './data/schools_nonnormalised_adjustedforobjectification.json';
var newFilePath = './data/lookupLADtoMSOA_with_schools.json'; //output

var fs = require('fs');
var fileOpen = require("./bin/fileopen");
var schoolsArray = [];
var resultArray = [];
var oOutput = {};
var outputFD;


function listLA (){
	fileOpen.jsonFileOpen(pathToInput, function(parsedJSON, fd) {
		oOutput = parsedJSON;
		outputFD = fd;
		
		fileOpen.jsonFileOpen(pathToSchools, function (parsedSchools, fsSchools) {
			schoolsArray = parsedSchools;
			
			
			
			for (var i = 0; i < schoolsArray.length; i++){
			
				var singleEntry = schoolsArray[i];
				
				console.log(singleEntry["_id"]+" singleEntry");
				var LADid = singleEntry.localAuthority.LACode;
				var schoolID = singleEntry["_id"];
				
				//appendMSOA (LADid, schoolID);
				
				//function: check if such key created
				if(!oOutput[LADid]){
					oOutput[LADid] = {};
					oOutput[LADid].status = "LAD not present in lookupLADtoMSOA";
					oOutput[LADid].schools = [];
					// read aMSOA, append, return
					appendMSOA (LADid, schoolID);
				} else {
					// read aMSOA, append, return
					appendMSOA (LADid, schoolID);
				}
			}
			fs.closeSync(fsSchools);
			writeFile(oOutput);
			//chng!!!!!!fileOpen.jsonFileWrite(oOutput, outputFD, pathToInput);
		});
	});
}

function appendMSOA (LADid, schoolID) {
	var array = oOutput[LADid].schools;
	
	array.push(schoolID);
	
	oOutput[LADid].schools = array;
}

function writeFile (newObject) {
	var stringified = JSON.stringify(newObject);
	
	fs.writeFile(newFilePath, stringified, function (err) {
		if (err) {console.log(err)};
		console.log("done");
	});
}

listLA();