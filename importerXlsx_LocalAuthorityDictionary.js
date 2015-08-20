var fs = require('fs');

var pathToFile = './data/databases/lookupMSOAtoLAD.csv';
var pathToOutputFile = './data/LADtoMSOAlookup.json';
var template = require ('./data/JSONtemplates/lad_msoa_template.json');
var outputFD;

/******************
Creation of Local Authority dictionary, where each object has MSOA id and name and corresponding LA id and name.


DESCRIPTION CAN BE FOUND IN: importerCsvXlsx_stores.js


(the code is nearly identical, I just did not thing of modularising it at all...)
*******************/

var arrIndex = 0;
var jsonArray =[];
var singleEntry = template;


var headerDictionary = [
    {key:"MSOA11CD", value:"MSOA11CD"},
    {key:"MSOA11NM", value:"MSOA11NM"},
    {key:"LAD11CD", value:"LAD11CD"},
    {key:"LAD11NM", value:"LAD11NM"}
];

var headerColumnLocation = [];

// establishment status, type of establishment?!!!?
// USE: CSV.detect to detect separator!
var header = [];
var noOfLines = 0;
var bufferString, bufferStringSplit;

function csvToString (callback) {

    fs.readFile ( pathToFile, function fileReading  (err, dataset) {
        if (err){
            return console.log(err);
        } else {
            bufferString = dataset.toString().replace(/"/g, "");  // RegEx to match `"` characters, with `g` for globally (instead of once)
            bufferStringSplit = bufferString.split("\n");
            noOfLines = bufferStringSplit.length - 1;
            console.log('\n' + 'Done: File read correctly.');

            fs.open(pathToOutputFile, 'w', function (err, fd) {
                if (err) {console.log(err);}
                outputFD = fd;
                callback();
            });
        }
    });
}

function writeToJSON () {
	readHeader ();
	
    for (var i = 1; i < noOfLines; i++){
		singleEntry = JSON.parse(JSON.stringify(template));
        appendToArray(i, singleEntry);
    }
	
    var txt = JSON.stringify(jsonArray, null, "\t");

    fs.writeSync(outputFD, txt) ;
    fs.close(outputFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("Dataset was parsed to the JSON format");
        });
}


function readHeader () {
    var headerString = bufferStringSplit[0];
    header = headerString.split(",");
    console.log('\n' + 'Done: Header read to list.'+ '\n');

    for (var i = 0; i < headerDictionary.length; i++) {
        var columnLocation = header.indexOf(String(headerDictionary[i].value));
        headerColumnLocation.push({
            key: headerDictionary[i].key,
            value: columnLocation
        });

        if (columnLocation === -1 ) {
            console.log("Error. no column: " + headerDictionary[i].value + " found.");
        }
    }
}

function appendToArray (j, singleEntry){
	
    var processedLine = bufferStringSplit[j].split(/,(?!\s)/);
	
    for (k=0; k < headerColumnLocation.length; k++ ){
        var location = headerColumnLocation[k].value;
        var key = headerDictionary[k].key;
        
		objectByString(singleEntry, key, processedLine[location]);
    }
    jsonArray[arrIndex] = singleEntry;
    arrIndex++;

    console.log("Record: " + singleEntry.school_id + " submitted.");
}

function objectByString (obj, str, keyValue) {
    str = str.replace(/\[(\w+)\]/g, '.$1');  // convert indexes to properties
    str = str.replace(/^\./, ''); // strip leading dot
	
    var pathSeparated = str.split('.');
	
    for (var i = 0, k = pathSeparated.length; i < k - 1 ; ++i) {
        var n = pathSeparated[i];
	
		if (n in obj) {
            obj = obj[n];
        } else {
            return;
        }
    }
	obj[pathSeparated[pathSeparated.length - 1]] = keyValue;
    return obj;
}

csvToString(writeToJSON);