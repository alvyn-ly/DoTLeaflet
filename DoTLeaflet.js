function initializeMap(div) {
    //$("head").append('<script type="text/javascript" src="' + "https://leaflet.visualizedot.com/leaflet/js/esri_leaflet.js" + '"></script>');
    //$("head").append('<script type="text/javascript" src="' + "https://unpkg.com/leaflet@1.0.3/dist/leaflet.js" + '"></script>');
    //require("https://leaflet.visualizedot.com/leaflet/js/esri_leaflet.js");
    //require("https://unpkg.com/leaflet@1.0.3/dist/leaflet.js");
    var esriLayer;
    var map;
    console.log("2");
    esriLayer = L.esri.basemapLayer('Topographic');
    map = L.map( div ,{layers: esriLayer}).setView([37.33766995, -121.8874011], 16);
}