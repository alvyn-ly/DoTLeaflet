requirejs.config({
	//urlArgs: "bust=" + (new Date()).getTime(),
	paths: {
		leafletLib: 'leafletLib',
		JQuery: 'JQuery',
		JQuery_ui: 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min',
		LoadCSS: 'LoadCSS',
		DoT_leaflet: 'DoTLeaflet',
		leaflet: 'leaflet',
		esri_leaflet: 'esri_leaflet',
		googleAPI: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBimi-uaVPiKmbW53QUc61AOkzflR0XzZs&sensor=false&libraries=places',
		smoothMarkerBouncing: 'smoothMarkerBouncing',
		Leaflet_Google: 'Leaflet_Google',
		easyButton: 'easy-button',
		spiderfy: 'oms.min'
	},
	shim: {
		'DoT_leaflet': {
			deps: ['spiderfy', 'easyButton', 'leaflet', 'esri_leaflet','Leaflet_Google', 'googleAPI', 'leafletLib']
		},
		'Leaflet_Google': {
			deps: ['googleAPI'] 
		},
		'esri_leaflet': {
			deps: ['leaflet']
		},
		'easyButton': {
			deps: ['leaflet']
		},
		'JQuery_ui': {
			deps: ['JQuery']
		}
	}
});



require(["JQuery_ui", "JQuery", "LoadCSS", "DoT_leaflet", "leaflet", "esri_leaflet", "googleAPI", "smoothMarkerBouncing", "Leaflet_Google"]);
