requirejs.config({
	//urlArgs: "bust=" + (new Date()).getTime(),
	paths: {
		leafletLib: 'lib/leafletLib',
		JQuery: 'lib/JQuery',
		JQuery_ui: 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min',
		LoadCSS: 'lib/LoadCSS',
		DoT_leaflet: 'lib/DoTLeaflet',
		leaflet: 'lib/leaflet',
		esri_leaflet: 'lib/esri_leaflet',
		//googleAPI: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBimi-uaVPiKmbW53QUc61AOkzflR0XzZs&sensor=false&libraries=places',
		smoothMarkerBouncing: 'lib/smoothMarkerBouncing',
		Leaflet_Google: 'lib/Leaflet_Google',
		easyButton: 'lib/easy-button',
		oms: 'lib/oms'
	},
	shim: {
		'oms': {
			deps: ['leaflet']
		},
		'DoT_leaflet': {
			deps: ['easyButton', 'leaflet', 'esri_leaflet','Leaflet_Google', 'leafletLib']
		},
		'Leaflet_Google': {
			deps: [] 
		},
		'esri_leaflet': {
			deps: ['oms', 'leaflet']
		},
		'easyButton': {
			deps: ['leaflet']
		},
		'JQuery_ui': {
			deps: ['JQuery']
		}
	}
});



require(["oms", "JQuery_ui", "JQuery", "LoadCSS", "DoT_leaflet", "leaflet", "esri_leaflet", "smoothMarkerBouncing", "Leaflet_Google"]);