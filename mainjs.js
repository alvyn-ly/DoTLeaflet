require.config({
	paths: {
		DoT_leaflet: 'DoTLeaflet',
		leaflet: 'leaflet',
		esri_leaflet: 'esri_leaflet'
	}
	shim: {
		'DoT_leaflet': {
			deps: ['leaflet', 'esri_leaflet']
		},
		'esri_leaflet': {
			deps: ['leaflet']
		}
	}
});

require(["DoT_leaflet", "leaflet", "esri_leaflet"]);

