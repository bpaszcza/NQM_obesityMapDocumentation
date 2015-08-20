var fs = require('fs');
var path = require('path');
var XLSX = require('xlsx');

var pathToFile = './data/databases/msoa_complete.xlsx';
var pathToOutputFile = './data/msoa_2011_07_01_complete.json';
var template = require ('./data/JSONtemplates/msoa_template.json');
var outputFD;

/******************
Code to import MSOA information (obesity rates, unemployment, causes for deaths, etc.)

DESCRIPTION CAN BE FOUND IN: importerCsvXlsx_stores.js


(the code is nearly identical, I just did not thing of modularising it at all...)
*******************/


var arrIndex = 0;
var jsonArray =[];
var singleEntry = template;


var headerDictionary = [ //change.
    {key:"_id", value:"code"},
    {key:"msoaName", value:"MSOA (2011)"},
    {key:"children.percObeseReception", value:"Obese Children (Reception Year)"},
    {key:"children.percExcessWeightReception", value:"Children with excess weight (Reception Year)"},
	{key:"children.percObeseYr6", value:"Obese Children (Year 6)"},
	{key:"children.percExcessWeightYr6", value:"Children with excess weight (Year 6)"},
	{key:"children.developmentAt5", value:"Child Development at age 5"},
	{key:"children.GCSEAchievement", value:"GCSE Achievement (5A*-C inc. Eng & Maths)"},
    {key:"adults.percObese", value:"Obese adults"},
	{key:"adults.percHealthyEating", value:"Healthy eating adults"},
    {key:"community.incomeDeprivation.absolute", value:"Income Deprivation - Number"},
	{key:"community.incomeDeprivation.perc", value:"Income Deprivation"},
	{key:"community.childPoverty.absolute", value:"Child Poverty - Number"},
	{key:"community.childPoverty.perc", value:"Child Poverty"},
	{key:"community.blackAndMinorityPopulation", value:"Black and Minority Ethnic (BME) Population"},
	{key:"community.notWhiteUKPopulation", value:"Population whose ethnicity is not 'White UK'"},
	{key:"community.percEnglishProficiency", value:"Proficiency in English (% of people who cannot speak English well or at all)"},
	{key:"community.unemployment", value:"Unemployment"},
	{key:"community.householdsCentralHeating", value:"Households with central heating"},
    {key:"lifeExpectancy.maleAtBirth", value:"Life expectancy at birth for males"},
	{key:"lifeExpectancy.femaleAtBirth", value:"Life expectancy at birth for females"},
	{key:"health.statistics.badAndVeryBad", value:"General Health - bad or very bad"},
	{key:"health.statistics.veryBad", value:"General Health - very bad"},
	{key:"health.deaths.circulatoryAllAge", value:"Deaths from circulatory disease, all ages"},
	{key:"health.deaths.circulatoryAbove75Age", value:"Deaths from circulatory disease, under 75 years"},
	{key:"health.deaths.coronaryHeartAllAge", value:"Deaths from coronary heart disease, all ages"},
	{key:"health.deaths.coronaryHeartAbove75Age", value:"Deaths from coronary heart disease, under 75 years"},
	{key:"health.deaths.strokeAllAge", value:"Deaths from stroke, all ages"},
	{key:"health.deaths.respiratoryAllAge", value:"Deaths from respiratory diseases, all ages"}
];

var headerColumnLocation = [];

// establishment status, type of establishment?!!!?
// USE: CSV.detect to detect separator!
var header = [];
var noOfLines = 0;
var bufferString, bufferStringSplit;

function fileToString (callback) {
	
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
		var data = xlsxToCsv (dataset);
		stringifyCSV (data);
		
	} else {
		console.log("Unknown filetype, please support with .xslx or .csv");
	}
	
	fs.open(pathToOutputFile, 'w', function (err, fd) {
		if (err) {console.log(err);}
		outputFD = fd;
		callback();
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

function stringifyCSV (dataset) {
	bufferString = dataset.toString().replace(/"/g, "");  // RegEx to match `"` characters, with `g` for globally (instead of once)
	bufferStringSplit = bufferString.split("\n");
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
	console.log("xlsxToCsv done");
    return result.join("\n");
}


function readHeader () {
    var headerString = bufferStringSplit[0];
    header = headerString.split(/,(?!\s)/); //matches all strings, neglecting ", " cases inside strings
    console.log('\n' + 'Done: Header read to list.'+ '\n');

    for (var i = 0; i < headerDictionary.length; i++) {
        var columnLocation = header.indexOf(String(headerDictionary[i].value));
        headerColumnLocation.push({
            key: headerDictionary[i].key,
            value: columnLocation
        });

        if (columnLocation === -1 ) {
            console.log("Error. no column: " + headerDictionary[i].key + " found.");
        }
    }
}

function appendToArray (j, singleEntry){
	
    var processedLine = bufferStringSplit[j].split(",");
	
	if (headerColumnLocation[0].value == -1){// temporary, creates ID instead of copying it
		objectByString(singleEntry, '_id', arrIndex);
	} // temporary
	
    for (k=0; k < headerColumnLocation.length; k++ ){ //should be 0 for whenever _id is not created, but copied!!!!!
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