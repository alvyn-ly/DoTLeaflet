var reloadMap;
define(['JQuery', 'JQuery_ui', 'leaflet', 'Leaflet_Google', 'leafletLib'], function(JQuery, leafletLib) {
	var init;
	var map;
	var menu;
	var oms;
	var myIcon;
	var projectArray = [];
	var projectsLayer;
	var shopArray = [];
	var customLayerArray = [];
	var records1;
	var markers = []; // an array containing all the markers added to the map
	var streetlightWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/StreetlightUpdate/FeatureServer/0'; //MUST be https for salesforce to accept
	var privateStreetsURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/private_streets/FeatureServer/0';
	var incorporatedWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/incorporated_areas_mask/FeatureServer/0';
	var gflandscapeWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/landscaping_city_all/FeatureServer/3';
	var sdlandscapeWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/landscaping_city_all/FeatureServer/1';
	var councilWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/council/FeatureServer/0';
	var quadzoneWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/ElectricianQuads/FeatureServer/0';

	init = function initializeMap(options) {
		var esriLayer;

		if (options.SessionID != null){
			sforce.connection.sessionId = options.SessionID;
		}
		
		map = L.map(options.div).setView([37.33766995, -121.8874011], 16);
		esriLayer = L.esri.basemapLayer('Topographic').addTo(map);
		map.scrollWheelZoom.disable();
		map.on('focus', function() { map.scrollWheelZoom.enable(); });
		map.on('blur', function() { map.scrollWheelZoom.disable(); });
		menu = L.control.layers({
		}, {
		}, {position: 'topright', collapsed: true})

		oms = new OverlappingMarkerSpiderfier(map);

		oms.addListener('spiderfy', function(markers) {
			map.closePopup();
		});

		if (options.customLayer != null){
			for (var j = 0; j < options.customLayer.length; j++){
				createMarkerLayer(options.customLayer[j]);
			}
			for (var i = 0; i < customLayerArray.length; i++){
				sfLayerHelper(i);
				menu.addOverlay(customLayerArray[i])
			}
		}

		function sfLayerHelper(number){
			var min = 0;
			var max = 20;
			if (options.customLayer[number].minZoom >= 0 && options.customLayer[number].maxZoom >= options.customLayer[number].minZoom){
				min = options.customLayer[number].minZoom;
				max = options.customLayer[number].maxZoom;
			}
			function layerBounds(e){
				placeMarkersInBounds(customLayerArray[number], min, max);
			}
			map.on('moveend', layerBounds);
			map.on('zoomend', layerBounds);
			layerBounds();
		}

		if (options.projectsLayer && options.filterQuery == null){
			var timedQuery = timeFilter(projQuery);
			var records = sforce.connection.query(timedQuery);
			records1 = records.getArray('records');
			createProjMarkers(records1);
			menu.addOverlay(projectsLayer, "Projects");
		} else if (options.filterQuery != null){
			var records = sforce.connection.query(options.filterQuery);
			records1 = records.getArray('records');
			createProjMarkers(records1);
			menu.addOverlay(projectsLayer, "Projects");
		}

		if (options.shopsLayer){
			getShops();
			function shopBounds(e){
				placeMarkersInBounds(shopArray, 16, 20);
			}
			map.on('moveend', shopBounds);
			map.on('zoomend', shopBounds);
			shopBounds();
		}

		if (options.search){
			new L.Control.GoogleAutocomplete().addTo(map);
		}

		if (options.dragMarker){
			addMarkers();
			var commandDrag = L.control({position: 'bottomright'});
			commandDrag.onAdd = function (map) {
				var div = L.DomUtil.get('marker-menu');
				return div;
			}; 
			commandDrag.addTo(map);
			noDrag(commandDrag);
		}

		if (options.lat != undefined && options.lng != undefined){
			processLocation(options.lng, options.lat, null, null, null);
		}
		if (options.zoom != undefined && Number.isInteger(options.zoom)){
			map.setZoom(options.zoom);
		}

		// -----------------------  ESRI OPTIONS ------------------------ //
		if (options.quadZone){
			var quadMap = L.esri.featureLayer({
				url: quadzoneWFSURL,
				simplifyFactor: 1,
				precision: 5,
				fillColor: 'none',
				minZoom: 0,
				maxZoom: 20,
				style : function (feature){
					return { color: 'blue',opacity: 1, weight: 1 };
				}
			}).addTo(map); 
			var quads = [];
			quadMap.on('createfeature', function(e){
				// console.log(e.feature.properties);
				var id = e.feature.id;
				var feature = quadMap.getFeature(id);
				var center = feature.getBounds().getCenter();
				var label = L.marker(center, {
					icon: L.divIcon({
						iconSize: null,
						className: 'labelQuad',
						html: '<div>' + e.feature.properties.QUAD + '</div>'
					})
        			//e.feature.properties.DISTRICT
        		}).bindPopup('<p style="text-align:center"><b>Quad Zone</b><br>' + e.feature.properties.QUAD + '</p>');
				quads.push(label);
			});
			function quadBounds(e){
				placeMarkersInBounds(quads, 13, 20);
			}
			map.on('moveend', quadBounds);
			map.on('zoomend', quadBounds);
			quadBounds();
			menu.addOverlay(quadMap, "Quad Zones");
		}


		if (options.streetlights){
			var streetLight = L.esri.featureLayer({
				url: streetlightWFSURL,

				minZoom: 17,
				maxZoom: 19,
				style : function (feature){
					return { color: '#b3b3cc',opacity: 0.75, weight: 5 };
				}
			}).addTo(map);  
			streetLight.bindPopup(function (feature) {

            	return L.Util.template('<p style="text-align:center"><b>Streetlight ID: </b><br>{BADGE}</p>', feature.properties);//just adds to layer, popup on label is above
            });  
            menu.addOverlay(streetLight, "Streetlights");
		}

		if (options.councilZone){
			//POLICE BEATS
			//add a WFS police beats
			var policebeats = L.esri.featureLayer({
				url: councilWFSURL,
				simplifyFactor: 1,
				precision: 5,
				fillColor: 'none',
				color: 'red',
				weight: 1.5,
				minZoom: 12,
				maxZoom: 15
			}).addTo(map);
			var beatLabels = [];
        	//Labels for police beats
        	policebeats.on('createfeature', function(e){
        		var id = e.feature.id;
        		var feature = policebeats.getFeature(id);
        		var center = feature.getBounds().getCenter();
        		var label = L.marker(center, {
        			icon: L.divIcon({
        				iconSize: null,
        				className: 'label',
        				html: '<div>' + e.feature.properties.DISTRICT + '</div>'
        			})
        		}).addTo(map).bindPopup('<p style="text-align:center"><b>Council District</b><br>' + e.feature.properties.DISTRICT + '</p>');
        		beatLabels.push(label);
        	});

        	//make some policebeats popups
        	policebeats.bindPopup(function (feature) {
            	return L.Util.template('<p style="text-align:center"><b>Police Beat</b><br>{DISTRICT}</p>', feature.properties);//just adds to layer, popup on label is above
            });
        	menu.addOverlay(policebeats, "Council Zones");
        	function beatBounds(e){
        		placeMarkersInBounds(beatLabels, 0, 20);
        	}
        	map.on('moveend', beatBounds);
        	map.on('zoomend', beatBounds);
        	beatBounds();
        }

        if (options.esriSet){

        	var privateStreets = L.esri.featureLayer({
        		url: privateStreetsURL,
        		minZoom: 17,
        		maxZoom: 19,
        		style : function (feature){
        			return { color: '#b3b3cc',opacity: 0.75, weight: 5 };
        		}
        	}).addTo(map);     
        	menu.addOverlay(privateStreets, "Private Streets");
       		//END PRIVATE STREETS

        	//add a WFS incorporated
        	incorporatedLayer('add', 'black'); //added by this special function to allow change color dynamically

        	// //add a WFS gflandscape
        	// var gflandscape = L.esri.featureLayer({
        	// 	url: gflandscapeWFSURL,
        	// 	simplifyFactor: 0.5,
        	// 	precision: 6,
         //    	//fillColor: 'black',
         //    	color: 'green',
         //    	weight: 1.8,
         //    	minZoom: 16,
         //    	maxZoom: 19
         //    }).addTo(map);

        	// //Popup for gflandscape
        	// gflandscape.bindPopup(function (feature) {
        	// 	return L.Util.template('General Fund Landscaping', feature.properties);
        	// });

        	// //add a WFS sdlandscape
        	// var sdlandscape = L.esri.featureLayer({
        	// 	url: sdlandscapeWFSURL,
        	// 	simplifyFactor: 0.5,
        	// 	precision: 6,
         //    	//fillColor: 'black',
         //    	color: 'blue',
         //    	weight: 1.8,
         //    	minZoom: 16,
         //    	maxZoom: 19
         //    }).addTo(map);

        	// //Popup for sdlandscape
        	// sdlandscape.bindPopup(function (feature) {
        	// 	return L.Util.template('Special Districts Landscaping', feature.properties);
        	// });
        }
        // -------------------- END ESRI OPTIONS ---------------------- //

        if (options.layerMenu){
        	menu.addTo(map);
        }
    } 


    function getShops(){
    	var shops = sforce.connection.query(shopQuery);
    	var recordsShop = shops.getArray('records');

    	for (var i = 0; i < recordsShop.length; i++){
    		myIcon = L.icon({
    			iconUrl: miniShopIcon,
    			iconSize: [30, 30], 
    			iconAnchor: [15, 30], 
    			popupAnchor: [0, -30]  
    		});
    		var marker = new customMarker([recordsShop[i].Geolocation__Latitude__s, recordsShop[i].Geolocation__Longitude__s], {icon: myIcon, allData: recordsShop[i]})
    		.bindPopup("Shop Number: " + recordsShop[i].Name + "<br>" + recordsShop[i].IntersectionName__c)
    		.on('click', function () {
						//this.bounce(3);
						try {
							pushData(this.options.allData);
							googleReverseGeocode(parseFloat(this.options.allData.Geolocation__Latitude__s), parseFloat(this.options.allData.Geolocation__Longitude__s), false);
						} catch(e) {
							if (options.error){
								console.log("pushData() has an error.")
								console.log("Error", e.stack);
								console.log("Error", e.name);
								console.log("Error", e.message);
							}
						}
					});
    		shopArray.push(marker);
    		//oms.addMarker(marker);
    	} 
    }

    function placeMarkersInBounds(markersArray, smallZoom, bigZoom) {
    	var mapBounds = map.getBounds();
    	for (var i = markersArray.length -1; i >= 0; i--) {
    		var m = markersArray[i];
    		var shouldBeVisible = mapBounds.contains(m.getLatLng());
    		if ((m._icon && !shouldBeVisible) || (map.getZoom() > bigZoom || map.getZoom() < smallZoom)) {
    			map.removeLayer(m);
    		} else if (!m._icon && shouldBeVisible && (map.getZoom() >= smallZoom && map.getZoom() <= bigZoom)) {
    			map.addLayer(m);
    		}
    	}
    }

    function placeLayersInBounds(layerGroup, smallZoom, bigZoom) {
    	//console.log(markersArray);
    	var mapBounds = map.getBounds();
    	layerGroup.eachLayer(function (layer) {
    		console.log(layer);
    		var shouldBeVisible = mapBounds.contains(layer.getLatLng());
    		if ((layer._icon && !shouldBeVisible) || (map.getZoom() > bigZoom || map.getZoom() < smallZoom)) {
    			map.removeLayer(layer);
    		} else if (!layer._icon && shouldBeVisible && (map.getZoom() >= smallZoom && map.getZoom() <= bigZoom)) {
    			map.addLayer(layer);
    		}
    	});
    }

    function makeIcon(type, status, focus){
    	var pic = "";
    	if (type == "Signal"){
    		pic = signalsProjMarker;
    	} else if (type == "Geometric") {
    		pic = signalsGeometricMarker;
    	} else if (type == "Traffic Calming"){
    		pic = signalsTrafficCalmingMarker;
    	} else {
    		console.log("Uh oh! Wrong Marker type!")
    	}

    	if (status == "Open"){
    		pic = pic + orangeHue;
    	} else if (status == "Assigned"){
    		pic = pic + greenHue;
    	} else if (status == "Pending"){
    		pic = pic + blueHue;
    	} else if (status == "Priority"){
    		pic = pic + redHue;
    	} else if (status == "Complete"){
    		pic = pic + blackHue;
    	} else {
    		console.log("Uh oh! Wrong Marker status!")
    	}
    	var focustype = '';
    	if (focus){
    		focustype = 'leaflet-div-focusIcon';
    	} else {
    		focustype = 'leaflet-div-icon';
    	}
    	myIcon = L.divIcon({
    		html:pic,
    		className: focustype,
    		iconSize: new L.Point(50, 50),
    		iconAnchor: new L.Point(25, 50),
    		popupAnchor: new L.Point(0, -50)
    	});
    }

    //Default timeframe in case none is set is 6 months!
    function timeFilter(query){
    	var endQuery = query;
    	if (options.dateFrom != undefined && options.dateTo != undefined){
    		var addon = " Where ";
    		var from = options.dateFrom.yyyymmdd() + "T00:00:00Z";
    		var to = options.dateTo.yyyymmdd() + "T23:00:00Z";
    		var append = addon + " p.ReceiveDateTime__c > " + from + " AND p.ReceiveDateTime__c < " + to;
    		endQuery = endQuery + append;
    	} else {
    		var today = new Date();
    		var halfYearAgo = addMonths(new Date(), defaultTimeFilterOffset);

    		var addon = " Where (";
    		var from = halfYearAgo.yyyymmdd() + "T00:00:00Z";
    		var to = today.yyyymmdd() + "T23:00:00Z";
    		var append = addon + " p.ReceiveDateTime__c > " + from + " AND p.ReceiveDateTime__c < " + to + " ) OR p.Name = '" + options.focus + "'";
    		endQuery = endQuery + append;
    	}
    	// console.log(endQuery);
    	return endQuery;
    }

    function createMarkerLayer(records){
    	customMarker = L.Marker.extend({
    		options: { 
    			allData: "",
    		}
    	});
    	var newLayer = [];
    	var icon;
    	for (var i = 0; i < records.items.length; i++){
    		if (!records.items[i].Geolocation__Latitude__s || 0 === records.items[i].Geolocation__Latitude__s.length || !records.items[i].Geolocation__Longitude__s || 0 === records.items[i].Geolocation__Longitude__s.length) { continue; }
    		else if (records.items[i].Name === options.focus){
    			icon = L.divIcon({
    				html: records.focusImage,
    				// className: focustype,
    				iconSize: new L.Point(25, 25),
    				iconAnchor: new L.Point(12, 25),
    				popupAnchor: new L.Point(0, -25)
    			});
    			map.panTo(new L.LatLng(records.items[i].Geolocation__Latitude__s, records.items[i].Geolocation__Longitude__s));
    		} else {
    			icon = L.divIcon({
    				html: records.image,
    				// html: signalsProjMarker + orangeHue,
    				// className: focustype,
    				iconSize: new L.Point(25, 25),
    				iconAnchor: new L.Point(12, 25),
    				popupAnchor: new L.Point(0, -25)
    			});
    		}  
    		var marker = new customMarker([records.items[i].Geolocation__Latitude__s, records.items[i].Geolocation__Longitude__s], {icon: icon, allData: records.items[i]})
    		.bindPopup(L.Util.template(records.textBubble, records.items[i]))
    		.on('click', function () {
    			try {
    				pushData(this.options.allData);
    			} catch(e) {
    				if (options.error){
    					console.log("pushData() has an error.")
    					console.log("Error", e.stack);
    					console.log("Error", e.name);
    					console.log("Error", e.message);
    				}
    			}
    		});
    		newLayer.push(marker);
    		oms.addMarker(marker);
    	}
    	customLayerArray.push(newLayer);
    }

    function createProjMarkers(records){
    	customMarker = L.Marker.extend({
    		options: { 
    			allData: "",
    		}
    	});

    	for (var i = 0; i < records.length; i++){
    		if (records[i].Name === options.focus){
    			makeIcon(records[i].ProjectType__c, records[i].Status__c, true);
    			map.panTo(new L.LatLng(records[i].Geolocation__Latitude__s, records[i].Geolocation__Longitude__s));
    		} else {
    			makeIcon(records[i].ProjectType__c, records[i].Status__c, false);
    		}  
    		var marker = new customMarker([records[i].Geolocation__Latitude__s, records[i].Geolocation__Longitude__s], {icon: myIcon, allData: records[i]})
    		.bindPopup( records[i].Name__c + "" )
    		.on('click', function () {
					//this.bounce(3);
					try {
						pushData(this.options.allData);
					} catch(e) {
						if (options.error){
							console.log("pushData() has an error.")
							console.log("Error", e.stack);
							console.log("Error", e.name);
							console.log("Error", e.message);
						}
					}
				});
    		projectArray.push(marker);
    		oms.addMarker(marker);
    	}
    	
    	projectsLayer = L.layerGroup(projectArray);
    	
    	projectsLayer.addTo(map);
    	// placeLayersInBounds(projectsLayer, 0, 20);
    }

    //use to add or change fill color of incorporated polygon, fires on basemap change
    function incorporatedLayer(active, color) {
    	if(active == "add") {
    		overlayIncorporated = L.esri.featureLayer({
    			url: incorporatedWFSURL,
    			simplifyFactor: .5,
    			precision: 6,
    			fillColor: color,
    			color: 'white',
    			weight: 0,
    			minZoom: 12,
    			maxZoom: 19
    		}).addTo(map);
            //Popup for incorporated
            overlayIncorporated.bindPopup(function (feature) {
            	return L.Util.template('Outside of Incorporated San Jose', feature.properties);
            });
            menu.addOverlay(overlayIncorporated, "Incorperated Layer");
        }
        if(active == "change_color") {
        	overlayIncorporated.setStyle({fillColor: color});  
        }        
    }

    function getDateString(date){
    	var today = date;
    	var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!

		var yyyy = today.getFullYear();
		if(dd<10){
			dd='0'+dd;
		} 
		if(mm<10){
			mm='0'+mm;
		} 
		var today = dd+'-'+mm+'-'+yyyy;
		return today;
	}

	function addMonths(date, months) {
		date.setMonth(date.getMonth() + months);
		return date;
	}

	Date.prototype.yyyymmdd = function() {
    	//getMonth() is zero-based
    	var mm = this.getMonth() + 1;  
    	var dd = this.getDate();

    	return [this.getFullYear(),
    	(mm>9 ? '' : '0') + mm,
    	(dd>9 ? '' : '0') + dd
    	].join('-');
    };

	/*
	 * Sets up the functionality for the draggable marker for the streetview. Allows for drag and drop, then repositioning, for updating the streetview location.
	 * @method addMarkers
	 */
	 var addMarkers = function () {
		//create new div
		var div1 = document.createElement("div");
		div1.id = "marker-menu";
		div1.setAttribute('class', 'marker-menu');
		var div2 = document.createElement("img");
		div2.id = "draggable-marker";
		div2.setAttribute('src', draggableMarker);
		div2.setAttribute('class', 'draggable-marker');
		document.body.appendChild(div1);
		document.getElementById("marker-menu").appendChild(div2);

		// The position of the marker icon
		var posTop = j$( '.draggable-marker' ).css( 'top' ),
		posLeft = j$( '.draggable-marker' ).css( 'left' );
		var mouseMarkerPosX;
		var mouseMarkerPosY;
		j$( '.draggable-marker' ).draggable({
			start: function (e, ui ){

				// mouse position on marker
				var offset = j$( '.draggable-marker' ).offset(); 
				mouseMarkerPosX = event.clientX - offset.left;
				mouseMarkerPosY = event.clientY - offset.top;
			},

			stop: function ( e, ui ) {
				// returning the icon to the menu
				j$( '.draggable-marker' ).css( 'top', posTop );
				j$( '.draggable-marker' ).css( 'left', posLeft );

				var coordsX = event.clientX - mouseMarkerPosX;
				var coordsY = event.clientY - 200 - mouseMarkerPosY;
				point = L.point( coordsX, coordsY ), // createing a Point object with the given x and y coordinates
				markerCoords = map.containerPointToLatLng( point ), // getting the geographical coordinates of the point

				createDragMarker(markerCoords.lat, markerCoords.lng);
				//console.log(markerCoords.lat + "   " + markerCoords.lng);  
				try {
					googleReverseGeocode(markers[0].getLatLng().lat,markers[0].getLatLng().lng, true);
					getDropLocation(markerCoords.lat, markerCoords.lng, markers[0]);  
				} catch (e) {
					if (options.error){
						console.log("getDropLocation() has an error.")
						console.log("Error", e.stack);
						console.log("Error", e.name);
						console.log("Error", e.message);
					}	
				}             
			}
		});
	}

	function createDragMarker(lat, lng){
		// Creating a custom icon
		myIcon = L.icon({
			iconUrl: draggableMarker, // the url of the img
			iconSize: [40, 40],
			iconAnchor: [40, 0] // the coordinates of the "tip" of the icon ( in this case must be ( icon width/ 2, icon height )
		});

		// Creating a new marker and adding it to the map
		if (markers[0] != null){
			map.removeLayer(markers[0]);
		}
		markers[0] = L.marker( [lat, lng], {
			draggable: true,
			icon: myIcon
		}).on('dragend', function(event){
			try {
				getDropLocation(markers[0].getLatLng().lat, markers[0].getLatLng().lng, markers[0]);
				googleReverseGeocode(markers[0].getLatLng().lat, markers[0].getLatLng().lng, true);
			} catch (e) {
				if (options.error){
					console.log("Error", e.stack);
					console.log("Error", e.name);
					console.log("Error", e.message);
				}
			}
		}).addTo( map );
	}

	/*
	 * adds eventlisteners to the chosen div to prevent the map from dragging when mouse events happen inside the div.
	 * @method noDrag
	 * @param info the div that is getting noDrag applied to it.
	 */
	 function noDrag(info){
		// Disable dragging when user's cursor enters the element
		info.getContainer().addEventListener('mouseover', function () {
			map.dragging.disable();
		});

		// Re-enable dragging when user's cursor leaves the element
		info.getContainer().addEventListener('mouseout', function () {
			map.dragging.enable();
		});
	}

	/**
	 * Replacement function over Google Streetview to just update the location after selecting a location through the search bar.
	 * @method processLocation
	 * @param passX the x coordinate
	 * @param passY the y coordinate
	 * @param addressBox 
	 * @param addressComponent
	 **/
	function processLocation(passX, passY, addressBox, addressComponents, shop) {//after the geocode search happens in the autocomplete box, I shut off all the google stuff and instead it just passes the x&y to this function where I can use it in Leaflet.
		map.setView(new L.LatLng(passY, passX), 16);
		try {
			setAddressInfo(passX, passY, addressBox, addressComponents, shop);  
		} catch (e) {
			if (options.error){
				console.log("setAddressInfo() has en error.")
				console.log("Error", e.stack);
				console.log("Error", e.name);
				console.log("Error", e.message);
			}
			
		} 
	}

	/** 
	 *GOOGLE AUTOCOMPLETE SCRIPT
	 * L.Control.GoogleAutocomplete - search for an address and zoom to it's location
	 * https://github.com/rmunglez/leaflet-google-autocomplete
	 **/
	 (function(j$, undefined) {
	 	L.GoogleAutocomplete = {};
	 	jQuery.support.cors = true;

	 	L.GoogleAutocomplete.Result = function (x, y, label) {
	 		this.X = x;
	 		this.Y = y;
	 		this.Label = label;
	 	};

	 	L.Control.GoogleAutocomplete = L.Control.extend({
	 		options: {
	 			position: 'topright'
	 		},

	 		initialize: function (options) {
	 			this._config = {};
	 			if (!options) {
	 				options = {};
	 			}
	 			var optionsTmp = {
	 				'searchLabel': options.searchLabel || 'Search for location...',
	 				'closeToMeLabel': options.closeToMeLabel || 'Close to me',
	 				'notFoundMessage' : options.notFoundMessage || 'Sorry, that address could not be found.',
	 				'zoomLevel': options.zoomLevel || 13
	 			}
	 			L.Util.extend(this.options, optionsTmp);             
	 		},

	 		onAdd: function (map) {
	 			var $controlContainer = j$(map._controlContainer);

	 			if ($controlContainer.children('.leaflet-top.leaflet-center').length == 0) {
	 				$controlContainer.append('<div class="leaflet-top leaflet-center"></div>');
	 				map._controlCorners.topcenter = $controlContainer.children('.leaflet-top.leaflet-center').first()[0];
	 			}

	 			this._map = map;
	 			this._container = L.DomUtil.create('div', 'leaflet-control-googleautocomplete');

	 			var searchwrapper = document.createElement('div');
	 			searchwrapper.className = 'leaflet-control-googleautocomplete-wrapper';

	 			var searchbox = document.createElement('input');
	 			searchbox.id = 'leaflet-control-googleautocomplete-qry';
	 			searchbox.type = 'text';
	 			searchbox.placeholder = this.options.searchLabel;
	 			this._searchbox = searchbox;

	 			var closetomebox = document.createElement('div');
	 			closetomebox.id = 'leaflet-control-googleautocomplete-closetome';
	 			closetomebox.className = 'leaflet-control-googleautocomplete-closetome';
	 			this._closetomebox = closetomebox;

	 			j$(searchwrapper).append(this._searchbox);
	 			j$(this._container).append(searchwrapper, this._closetomebox);


	 			L.DomEvent.addListener(this._container, 'click', L.DomEvent.stop);
	 			L.DomEvent.disableClickPropagation(this._container);

	 			L.DomEvent.addListener(this._closetomebox, 'click', this._closeToMe, this);
	 			L.DomEvent.disableClickPropagation(this._closetomebox);

	 			var autocomplete = new google.maps.places.Autocomplete(this._searchbox);
	 			autocomplete.setTypes(['geocode']);

	 			var Me = this;

	 			google.maps.event.addListener(autocomplete, 'place_changed', function() {
	 				//console.log(autocomplete);
	 				var place = autocomplete.getPlace();
	 				if (!place.geometry) {
	 					j$('leaflet-control-googleautocomplete-qry').addClass('notfound');
	 					return;
	 				}

	 				if (place.geometry.location) {
	 					j$('leaflet-control-googleautocomplete-qry').removeClass('notfound');
						processLocation(place.geometry.location.lng(), place.geometry.location.lat(), place.name, place.address_components, null); //this is going to main script area. passed variable is (x,y) for later parsing.
						searchbox.value = searchbox.value.replace(", United States","");//remove 'United States' because it is superfluous
					}
				});   

	 			j$(searchbox).keypress(function(e) {
					if(e.which == 13) { //if a number is entered into the searchbox, it will attempt to find the shopNo instead. 
						var geocoder;
						geocoder = new google.maps.Geocoder();
						if (searchbox.value[0] == '#'){
							var shopNum = searchbox.value.substring(1);
							var shopQuery = shopSearchQuery + shopNum;
							var shopRecords = sforce.connection.query(shopQuery);
							var shopRecords1 = shopRecords.getArray('records');
							var boundSW = google.maps.LatLng(37.2134286,-122.0329773);
							var boundNE = google.maps.LatLng(37.4410163,-121.759899);
							var bounds = google.maps.LatLngBounds(boundSW,boundNE);
							geocoder.geocode( {
								address: shopRecords1[0].IntersectionName__c + ", San Jose California",
								bounds: bounds,
								region: 'us'
							}, function(results, status) {
								if (status == google.maps.GeocoderStatus.OK) {
									createDragMarker(shopRecords1[0].GeolocationX__c, shopRecords1[0].GeolocationY__c);
									processLocation(shopRecords1[0].GeolocationY__c, shopRecords1[0].GeolocationX__c, toTitleCase(shopRecords1[0].IntersectionName__c) , results[0].address_components, shopNum);
								} else {
									alert('Location lookup was not successful for the following reason: ' + status); 
								}
							});
						} else {
							var preaddress = searchbox.value;
							var address = preaddress + ", San Jose California"
							var boundSW = google.maps.LatLng(37.2134286,-122.0329773);
							var boundNE = google.maps.LatLng(37.4410163,-121.759899);
							var bounds = google.maps.LatLngBounds(boundSW,boundNE);
							geocoder.geocode( {
								address: address,
								bounds: bounds,
								region: 'us'
							}, function(results, status) {
								if (status == google.maps.GeocoderStatus.OK) {
									processLocation(results[0].geometry.location.lng(), results[0].geometry.location.lat(), preaddress.replace("&","and").replace("amp;",""),results[0].address_components, null);
								} else {
									alert('Location lookup was not successful for the following reason: ' + status);
								}
							});
						}
					}
				});

	 			return this._container;
	 		},

	 		_closeToMe: function (e) {
	 			if (navigator.geolocation) {
	 				var Me = this;
	 				navigator.geolocation.getCurrentPosition(function(position) {
	 					alert(position.coords.latitude);
	 					Me._map.panTo([position.coords.latitude, position.coords.longitude]);
	 					Me._map.setZoom(Me.options.zoomLevel);
	 				});
	 			}
	 		},
	 	});
})(jQuery);

function toTitleCase(str)
{
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function googleReverseGeocode(passLat, passLng, getAddr) {
	var geocoder;
	geocoder = new google.maps.Geocoder();
	var latlng = {lat: passLat, lng: passLng};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				googleReverseGeocodeResult(results[0].formatted_address, getAddr);
			} else {
				console.log('Reverse location lookup: No results found');
			}
		} else {
			console.log('Reverse location lookup was not successful for the following reason: ' + status);
		}
	});
}

function googleReverseGeocodeResult(address, getAddr) {//does a replace to trim address and puts it into stand loc field
	if(address.substring(address.length-3,address.length) == "USA") {
		var nousaAddress = address.replace(", USA","");
		var nozipAddress = nousaAddress.substring(0,nousaAddress.length-6);
        var nocityAddress = nozipAddress.replace(", San Jose, CA","");//If it's in another city it will just leave the city
        zipcodeField.value = "";
        var zipcode = ((address.split(','))[(address.split(',').length) - 2]).replace(' CA ','');
        
    } else {
        var nocityAddress = address; //If it's in another country, then just spit back the address as is, user can figure it out
    }
    try {
    	var zip = "";
    	if(typeof zipcode !== "undefined"){ zip = zipcode; }
    	passMarkerAddress(nocityAddress, zip, getAddr);  
    } catch (e) {
    	if (options.error){
    		console.log("passMarkerAddress() has an error.")
    		console.log("Error", e.stack);
    		console.log("Error", e.name);
    		console.log("Error", e.message);
    	}
    } 
}	


reloadMap = function reload(){
	if (map != undefined) { map.remove(); }
	projectArray.length = 0;
	oms.clearMarkers();
	init(options);
}

	//END GOOGLE AUTO COMPLETE SCRIPT
	if (options != undefined){	
		init(options);
	}
})

