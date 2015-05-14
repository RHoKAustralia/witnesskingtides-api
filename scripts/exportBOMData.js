// Export data from BOM site
// Usage: 
// node exportBOMData.js > bom_data.json
// Import into Mongo
// mongoimport -d db -c kingtideevents < bom_data.json

"use strict"
var http=require('http');

var LOCATION_URL = "http://www.bom.gov.au/australia/tides/tide_prediction_sites.json";

downloadData(LOCATION_URL, convertBOMDataToOurData);

function convertBOMDataToOurData(json){
	var data = json.features.map(function(item){
		return {
				location: item.properties.PORT_NAME,
				state: item.properties.STATE_CODE,
				latitude: item.properties.LAT,
				longitude: item.properties.LON,
				highTideOccurs: null,
				eventStart: null,
				eventEnd: null,
				bom_id: item.properties.AAC,
				timezone: item.properties.TIME_ZONE,
				offset: item.properties.TIME_OFFSE,
				description: "",
				parent_bom_id: item.properties.PARENT_AAC
			}
	});
	
	// format for mongoimport
	for(var i = 0; i < data.length; i++){
		if(!data[i].timezone){
			var d = json.features.filter(function(item){ return item.properties.AAC == data[i].parent_bom_id})[0];
			data[i].timezone = d.properties.TIME_ZONE;
		}
		console.log(JSON.stringify(data[i]));
	}
}
function downloadData(url, callback){
	http.get(url, function(res) {
	    var body = '';
	    res.on('data', function(chunk) {
	        body += chunk;
	    });
	    res.on('end', function() {
	        var json = JSON.parse(body)
	        callback(json);
	    });
	}).on('error', function(e) {
	    console.error("Got error: ", e);
	});
}