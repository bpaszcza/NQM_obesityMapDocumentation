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

var pathToInput = './data/LADtoMSOAlookup.json';
var newFilePath = './data/lookupLADtoMSOA.json'; //output

var fs = require('fs');
var fileOpen = require("./bin/fileopen");
var lookupArray = [];
var resultArray = [];
var oOutput = {};
var outputFD;

function listLA (){
	fileOpen.jsonFileOpen(pathToInput, function(parsedJSON, fd) {
		lookupArray = parsedJSON;
		outputFD = fd;
			
			for (var i = 0; i < lookupArray.length; i++){
			
				var singleEntry = lookupArray[i];
				
				console.log(singleEntry+"singleEntry");
				var LADid = singleEntry.LAD11CD;
				var MSOAid = singleEntry.MSOA11CD;
				//function: check if such key created
				if(!oOutput[LADid]){
					oOutput[LADid] = {};
					oOutput[LADid].msoa = [];
					oOutput[LADid].schools = [];
					// read aMSOA, append, return
					appendMSOA (LADid, MSOAid);
				} else {
					// read aMSOA, append, return
					appendMSOA (LADid, MSOAid);
				}
			}
			writeFile(oOutput);
		});
}

function appendMSOA (LADid, MSOAid) {
	var array = oOutput[LADid].msoa;
	
	array.push(MSOAid);
	
	oOutput[LADid].msoa = array;
}

function writeFile (newObject) {
	var stringified = JSON.stringify(newObject);
	
	fs.writeFile(newFilePath, stringified, function (err) {
		if (err) {console.log(err)};
		console.log("done");
	});
}

listLA();