var request = require('request');
var fs = require('fs');
var data = {};
var outputFilePath = String('./data/food_initialdata' + pageIndex+".json");
var outputFD;

/******

JAVASCRIPT EXTRACTING DOCUMENTS FROM FOOD HYGIENE RATING API
documentation: http://ratings.food.gov.uk/open-data/en-GB


Note:
- FHRS API supports extraction in xml and json, here - json is used
- there is a limit of 5000 results/page. Hence here, multiple pages had to be appended into a single output json file

****** Breakdown of API's url: ******

http://ratings.food.gov.uk/enhanced-search/^/^/Type/7844/^/"+ String(pageIndex) +"/5000/json

Meaning: http://ratings.food.gov.uk/enhanced-search/[name, ^ meaning 'any']/[address, ^ meaning 'any' ]/[sortOrder, sort by Type]/[Type queried: 7844 meaning 'fastfoods and takeaway']/[pageIndex - which page of results is returned]/[number of entries per page, 5000 maximum]/[output file type]

***********

Example document:

	{
		"_id": "134047",
		"LocalAuthorityBusinessID": "67154",
		"BusinessName": "\"Buttylicious\"",
		"BusinessType": "Takeaway/sandwich shop",
		"BusinessTypeID": "7844",
		"AddressLine1": null,
		"AddressLine2": "299A Crankhall Lane",
		"AddressLine3": null,
		"AddressLine4": "Wednesbury",
		"PostCode": "WS10 0DX",
		"RatingValue": "5",
		"RatingKey": "fhrs_5_en-gb",
		"RightToReply": null,
		"RatingDate": "04 February 2015",
		"LocalAuthorityCode": "423",
		"LocalAuthorityName": "Sandwell",
		"LocalAuthorityWebSite": "http://www.sandwell.gov.uk/foodratings",
		"LocalAuthorityEmailAddress": "environmental_health@sandwell.gov.uk",
		"Scores": {
			"Hygiene": "5",
			"Structural": "0",
			"ConfidenceInManagement": "5"
		},
		"SchemeType": "FHRS",
		"NewRatingPending": "false",
		"Geocode": {
			"Longitude": "-2.000796",
			"Latitude": "52.55624"
		},
		"Distance": {
			"@xsi:nil": "true"
		},
		"coordinates": {
			"geoCode": {
				"lat": 52.55624,
				"lng": -2.000796
			}
		}
	}

*******/



var pageIndex = 1;
var singleEntry = {}; // results are appended to that variable


function obtainData () {
	request({
	
			url: String("http://ratings.food.gov.uk/enhanced-search/^/^/Type/7844/^/"+ String(pageIndex) +"/5000/json"),
			method: "GET", 
			headers: {"x-api-version": 2 }
			
			}, function(error, response, body) {
			var res = {};
			if (error) {
				console.log(error);
			}
			else {
				singleEntry = JSON.parse(body); 
				writeToJSON (singleEntry, main);	
			};
		}
	);
}

function initialise (outputFilePath, callback) {
	fs.open(outputFilePath, 'w', function (err, fd) {
                if (err) {console.log(err);
				}
                outputFD = fd;
				console.log("file created");
                callback();
            });
	
}

function main (){
	
	if (pageIndex < 11) {
		outputFilePath = String('./data/food_initialdata' + pageIndex+".json");
		initialise(outputFilePath, obtainData);
		
	}else{
		console.log("job done");
	}
}

function writeToJSON (data, callback) {	
	
    var txt = JSON.stringify(data, null, 4);

    fs.writeSync(outputFD, txt);
	
    fs.close(outputFD, function doneWriting (err){
            if (err) {console.log (err);}
            console.log("Page was parsed to the JSON format and saved to file");
        });
		
	pageIndex++;
	callback();
}

main();
