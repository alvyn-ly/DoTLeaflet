requirejs.config({
	paths: {
		DoT_leaflet: 'DoTLeaflet',
		leaflet: 'leaflet',
		esri_leaflet: 'esri_leaflet',
		googleAPI: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBimi-uaVPiKmbW53QUc61AOkzflR0XzZs&sensor=false&libraries=places',
		smoothMarkerBouncing: 'smoothMarkerBouncing',
		Leaflet_Google: 'Leaflet_Google'
	}
	//shim: {
	//	'DoT_leaflet': {
	//		deps: ['leaflet', 'esri_leaflet']
	//	},
	//	'esri_leaflet': {
	//		deps: ['leaflet']
	//	}
	//}
});

require(["DoT_leaflet", "leaflet", "esri_leaflet", "googleAPI", "smoothMarkerBouncing", "Leaflet_Google"]);

