var fs = require('fs');
var path = require('path');
var XLSX = require('xlsx'); // needs 'xlsx' module

/******* CODE TO CONVERT .XLSX or .CSV file to .JSON

Here: used to convert convenience stores dataset (from corelist.co.uk)

1. Needs template .json schema
2. Header dictionary specifies mapping between .xlsx/.csv column names (which necessarily need to be in the first row) to .json key names


*******/

var pathToFile = './data/databases/convenience_storesuk_full.xlsx';
var pathToOutputFile = './data/convenience_stores_2015_converted_07_07.json';

var template = require ('./data/JSONtemplates/stores_template.json');
var outputFD;


var arrIndex = 0;
var jsonArray =[];
var singleEntry = template;

var headerDictionary = [ //Adjust for use with different files
    {key:"_id", value:"nonexistent"},
    {key:"name", value:"Name"},
    {key:"type", value:"Type"},
    {key:"address.street", value:"Address"},
    {key:"address.city", value:"City"},
    {key:"address.postcode", value:"Zipcode"},
    {key:"coordinates.latitude", value:"nonexistent"},
    {key:"coordinates.longitude", value:"nonexistent"},
    {key:"websiteURL", value:"Website"}
];

var headerColumnLocation = [];

var header = [];
var noOfLines = 0;
var bufferString, bufferStringSplit;


function fileToString (callback) {
	
	// checking format of the input file
	if (path.extname(pathToFile) == '.csv') {
	
		fs.readFile ( pathToFile, function fileReading  (err, dataset) {
			if (err){
				return console.log(err);
			} else {
				stringifyCSV (dataset);
			}
		});
	} else if (path.extname(pathToFile) == '.xlsx' || path.extname(pathToFile) == '.xls'){
		
		var dataset = XLSX.readFile(pathToFile);
		var data = xlsxToCsv (dataset); //what I am really doing, is converting .xslx to .csv
		stringifyCSV (data);
		
	} else {
		console.log("Unknown filetype, please support data in .xslx or .csv");
	}
	
	fs.open(pathToOutputFile, 'w', function (err, fd) {
		if (err) {console.log(err);}
		outputFD = fd;
		callback(); //writeToJSON();
	});
}

// converting input lines into json schema key-value pairs
function writeToJSON () {
	// reads header, using dictionary above specifies, which column contains values for each key
	readHeader ();
	
    for (var i = 1; i < bufferStringSplit.length; i++){
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

// parses content of the input file to a string
function stringifyCSV (dataset) {
	
	//note: input 'dataset' is a buffer!
	
	//sanitise data
	bufferString = dataset.toString().replace(/"/g, "");  // RegEx to match `"` characters, with `g` for globally
	
	//break into lines
	bufferStringSplit = bufferString.split("\n");
	//bufferStringSplit = bufferString.split(/,(?!\s)/);
	
	noOfLines = bufferStringSplit.length - 1;
	console.log('\n' + 'Done: File read correctly.');
}

function xlsxToCsv (workbook) {
    var result = [];
    workbook.SheetNames.forEach(function(sheetName) {
        var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        if(csv.length > 0){
            result.push(csv);
        }
    });
    return result.join("\n");
}


function readHeader () {
    var headerString = bufferStringSplit[0]; //header line needs to be the first line of csv/xlsx
	
    header = headerString.split(","); //needs to be split on commas, should really be sanitised here...
	
    console.log('\n' + 'Done: Header read to list.'+ '\n');

    for (var i = 0; i < headerDictionary.length; i++) {
        var columnLocation = header.indexOf(String(headerDictionary[i].value));
        headerColumnLocation.push({ //creates a dictionary for values location for each key
            key: headerDictionary[i].key,
            value: columnLocation
        });

        if (columnLocation === -1 ) {
            console.log("Error. no column: " + headerDictionary[i].key + " found.");
        }
    }
}

function appendToArray (j, singleEntry){
	
    var processedLine = bufferStringSplit[j].split(/,(?!\s)/); //excludes commas with space afterwards, i.e. the ones in text in the process of splitting
	var k = 0;
	if (headerColumnLocation[0].value == -1){// temporary, creates id instead of copying it, when it is not available
		objectByString(singleEntry, '_id', arrIndex);
		k=1;
	} // temporary
	
    for (k; k < headerColumnLocation.length; k++ ){ //should be 0 for whenever _id is not created, but copied. K=1 when id number has been created
        var location = headerColumnLocation[k].value;
        var key = headerDictionary[k].key;
        
		objectByString(singleEntry, key, processedLine[location]);
    }
	jsonArray[arrIndex] = singleEntry;
    arrIndex++;

    console.log("Record: " + singleEntry._id + " submitted.");
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

fileToString(writeToJSON);