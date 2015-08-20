var LatLon = require('mt-latlon');
var CoordTransform = require('mt-coordtransform');
var OSPoint = require("ospoint");

exports.eastingsToWGS84 = function (jsonDoc, callback) {
	
	var easting = jsonDoc.coordinates.easting;
	var northing = jsonDoc.coordinates.northing;
	
	
	var point = new OSPoint( northing , easting );	
	var pointWGS = point.toWGS84(); 
	
	jsonDoc.coordinates.lat = pointWGS.latitude;
	jsonDoc.coordinates.lng = pointWGS.longitude;
	
	callback(jsonDoc);
}
//

exports.osgb36ToWGS84 = function (jsonDoc, callback) {
		
	var lat = jsonDoc.coordinates.geoCode.lat;
	var lng = jsonDoc.coordinates.geoCode.lng;
	
	var pointOSGB36 = new LatLon(lat, lng);
	var pointWGS84 = CoordTransform.convertOSGB36toWGS84(pointOSGB36);
	
	jsonDoc.coordinates = {};
	jsonDoc.coordinates.geoCode = {};
	
	jsonDoc.coordinates.geoCode.oldLat = lat;
	jsonDoc.coordinates.geoCode.oldLng = lng;
	
	jsonDoc.coordinates.geoCode.lat = pointWGS84["_lat"];
	jsonDoc.coordinates.geoCode.lng = pointWGS84["_lon"];
	
	jsonDoc.coordinates.geoCode.standard = 'WGS84';
	
	callback(jsonDoc);
}

exports.unifySchema = function (jsonDoc, callback) {
		
	var latval = jsonDoc.Geocode.Latitude;
	var lngval = jsonDoc.Geocode.Longitude;
	
	jsonDoc.coordinates = {};
	jsonDoc.coordinates.geoCode = {};
	
	jsonDoc.coordinates.geoCode.lat = Number(latval);
	jsonDoc.coordinates.geoCode.lng = Number(lngval);
	
	callback(jsonDoc);
}