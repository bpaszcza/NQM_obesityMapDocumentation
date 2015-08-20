//var geocoder = require('geocoder');
var fileOpen = require('./bin/fileopen');
var webImport = require('./bin/webimport');
var geoConverter = require("./bin/geoconverter");
var pathToInput = './data/convenience_stores_2015_dst_try3.json';
var jsonArray = [];

var initIndexValue = 0;
var endIndexValue = 100;


//var address = "1 Clunie Place, Aberdeen, AB16 5RN, United Kingdom"

function doNext(listIndex, jsonArray, callback) {
	console.log("now doing: %s", listIndex+1);

            if (listIndex < endIndexValue) {
				setTimeout(function() {
						processList(listIndex+1, jsonArray, callback);
					}, 100);
            
            } else {
                        callback();
            }
}

function processList(listIndex, jsonArray, callback) {
    
    var singleEntry = jsonArray[listIndex];
	
	var stringAddress = String(singleEntry.address.street + ",+" + singleEntry.address.postcode +",+"+ singleEntry.address.city+ ",+United Kingdom");
	
	stringAddress = stringAddress.replace(/ /g,"+");
	
	//console.log(stringAddress);
	
	var URL = "http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address="+stringAddress;
	
	webImport.obtainData(URL, stringAddress, singleEntry, function () {
		
		geoConverter.osgb36ToWGS84 (singleEntry, function () {
			jsonArray[listIndex] = singleEntry;
			doNext(listIndex, jsonArray, callback); 
		});
		
	});
}

// save JSON file??

function appendGeolocation (jsonParsed, outputFD){
	
	jsonArray = jsonParsed;
	
	processList(initIndexValue, jsonArray, function() {
		fileOpen.jsonFileWrite (jsonArray, outputFD);
		
        console.log("finished, " + jsonArray.length + " entries.");
});
}

fileOpen.jsonFileOpen(pathToInput, appendGeolocation);
