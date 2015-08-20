var geocoder = require('geocoder');
var fileOpen = require('./bin/fileopen'); //self made module for file opening/writing


var pathToInput = './data/convenience_stores_2015_gserv1.json'; //this is an input and output file, please backup before running

var jsonArray = []; // will contain resulting json structures

/*******
*	GOOGLE-API GEOCODER FOR BULK DATABASE	
*	
*	Made to run constantly and under the GOOGLE-API limit of 2500 queries/day (hence Timeout of 35.5s)
*	Backing up the written file after every 10 queries.
*	Note: no GOOGLE-API KEY needed.
*
*	Code may be run multiple times, it skips rows which are already done and begins from where it last ended.
*
*	Example of JSON structure used:

	{
		"_id": 0,
		"name": "Bellabeg Shop",
		"type": "General And Convenience Stores",
		"address": {
			"street": "Strathdon",
			"city": "Strathdon",
			"postcode": "AB36 8UL"
		},
		"coordinates": {
			"easting": "",
			"northing": "",
*ADD:		"geoCode": { 
*ADD:			"lat": 57.2040739,
*ADD:			"lng": -3.070043
*ADD:		},
*ADD:		"geoStatus": "OK"
		},
		"websiteURL": "http://genepool.bio.ed.ac.uk/glenbuchat/businessesandservices.html"
		
*
*
*	
*	Created by bartosz paszcza.
*/



var indexToBeginAt = 0; //starts from the beginning, unsurprisingly

function doNext(listIndex, jsonArray, outputFD, callback) { /* for recursively going through documents in collection*/
	
		if (listIndex >= jsonArray.length - 1)
		{
                        callback(); // if end is reached, go to final write-up
		}
		
		console.log("now doing: %s", listIndex);
		
		if (typeof jsonArray[listIndex+1].coordinates.geoStatus == undefined) { //checks whether given document was already geocoded, omits if so
			console.log("Doing new coordinates entry...");
			
			if (listIndex % 10 == 0) { /*this 'updates' the json file every tenth entry*/
				
				fileOpen.jsonFileWriteIntermediate (jsonArray, pathToInput, outputFD);
				
			}
			
			setTimeout(function() {
						processList(listIndex+1, jsonArray, outputFD, callback); 
			}, 35500); //Timeout of 35.5s is imposed in order not to exceed limit of 2500queries/24h
		} else {
			console.log("Coordinates already exist for that entry, proceed to do next");
			doNext(listIndex+1, jsonArray, outputFD, callback);
		}
}

function processList(listIndex, jsonArray, outputFD, callback) { /*processes a single document (singleEntry), finds its LatLong, and assigns it to the array of results (jsonArray)*/
    
    var singleEntry = jsonArray[listIndex];
	
	var stringAddress = String(singleEntry.address.street + ", " + singleEntry.address.city + ", " + singleEntry.address.postcode+ ", United Kingdom"); //string containing address of the location, put into the URL by geocoder.geocode
    
    geocoder.geocode(stringAddress, function (err, data) {
        if (data.status == "OK") {
            loc = data.results[0].geometry.location; // obtaining the most probable location
            singleEntry.coordinates.geoCode = loc;
			singleEntry.coordinates.geoStatus = data.status;
        } else {
			console.log(data.status);
			console.log("error: data status is not ok (processList)"); // usually: ZERO_RESULTS is given, indicating wrong address format
            singleEntry.coordinates.geoStatus = data.status;
        }
		
        jsonArray[listIndex] = singleEntry; //updating results array
		
        doNext(listIndex, jsonArray, outputFD, callback); 
    });
}

function appendGeolocation (jsonParsed, outputFD){ /* final step, after going through all the documents*/
	
	jsonArray = jsonParsed;
	
	processList(indexToBeginAt, jsonArray, outputFD, function() {
		fileOpen.jsonFileWrite (jsonArray, outputFD);
        console.log("finished, " + jsonArray.length + " entries.");
});
}

fileOpen.jsonFileOpen(pathToInput, appendGeolocation); //execute