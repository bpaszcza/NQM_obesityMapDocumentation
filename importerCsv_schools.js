var fs = require('fs');

/******************
Importer for schools data (from EduBase dataset)

DESCRIPTION CAN BE FOUND IN: CsvXlsxImporter_stores.js


(the code is nearly identical, I just did not thing of modularising it at all...)
*******************/




var pathToFile = './data/databases/edubasealldata20150629_sanitised.csv';
var pathToOutputFile = './data/schools_20150709_sanitised.json';
var template = require ('./data/JSONtemplates/schools_template.json');
var outputFD;


var arrIndex = 0;
var jsonArray =[];
var singleEntry = template;


var headerDictionary = [
//disappeared....
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

    if (singleEntry['establishmentStatus'] == "Open" && singleEntry['phaseOfEducation'] == "Primary") {
        jsonArray[arrIndex] = singleEntry;
        arrIndex++;

        console.log("Record: " + singleEntry.school_id + " submitted.");
    } else { 
        console.log("School " + singleEntry.school_id + " is either closed or not a Primary School, hence neglected.");
    }
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