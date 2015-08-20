var request = require('request');


exports.obtainData = function (URL, address, jsonDoc, callback) {
	request({
	
			url: String(URL),
			method: "GET", 
			headers: {}
			
		}, function(error, response, data) {
			var res = {};
			if (error) {
				console.log(error);
			}
			else {
				var temp = JSON.parse(data);
				
				//for google3 use:
				//var loc = temp.results.geometry.location;	
				
				if (temp.status !== "OK") {
					
					console.log(temp.status);
					console.log("error: data status is not ok");
					jsonDoc.coordinates.geoStatus = temp.status;
					callback();
					//checking for zero results
					
				} else {
					
					console.log(temp.results[0].geometry.location_type);
					var loc = temp.results[0].geometry.location;
					console.log(temp.results[0]);
					jsonDoc.coordinates.geoCode = loc; // CHANGE THIS !!!!!!!!
					jsonDoc.coordinates.geoStatus = temp.status;
					callback();
				}
			};
		}
	);
}