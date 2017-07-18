var reloadMap;
define(['JQuery', 'JQuery_ui', 'leaflet', 'Leaflet_Google', 'leafletLib'], function(JQuery, leafletLib) {
	var init;
	var map;
	var myIcon;
	var projectArray = [];
	var records1;
	var markers = []; // an array containing all the markers added to the map

	//---------EDITABLE FIELDS, MAKE CHANGES AS NESSESSARY--------------

	//Marker Icon HTML - BASE ICON COLOR MUST BE BLUE, OTHERWISE HUE SUFFIXES MUST BE CHANGED.
	var signalsProjMarker = '<img alt="Signal Project" src="https://i.imgur.com/GdAqjdS.png" title="Signal Project"';
	var signalsGeometricMarker = '<img alt="Geometric Project" src="https://i.imgur.com/NmlUzxO.png" title="Geometric Project"';
	var signalsTrafficCalmingMarker = '<img alt="Traffic Calming Project" src="https://i.imgur.com/sqSOaBX.png" title="Traffic Calming Project"';

	var blueHue = '>';
	var greenHue = ' class="huerotateN80">';
	var redHue = ' class="huerotate150">';
	var blackHue = ' class="grayscale">';
	var orangeHue = ' class="huerotate185">';

	//Select All SOQL Query. Change this if fields get added/removed from Projects
	var projQuery = "Select p.ZipCode__c, p.TrafficCalmingRequestType__c, p.TrafficCalmingProjectType__c, p.TrafficCalmingConcernType__c, p.TrafficCalmingConcernItem__c, p.TrafficAffected__c, p.SystemModstamp, p.Summary__c, p.Status__c, p.StandardizedLocation__c, p.SignalTimeOfDay__c, p.SignalSideOfStreet__c, p.SignalProjectType__c, p.SignalProblemDirection__c, p.SignalOperationAssignmentCount__c, p.SignalOperationAssignmentCompleteCount__c, p.SignalOperationAssignmentCancelledCount__c, p.SignalFundAdjustment__c, p.SignalDesignAssignmentCount__c, p.SignalDesignAssignmentCompleteCount__c, p.SignalDesignAssignmentCancelledCount__c, p.SignalDayOfWeek__c, p.SignalCustomerSurveySent__c, p.SignAssignmentCount__c, p.SignAssignmentCompleteCount__c, p.SignAssignmentCancelledCount__c, p.School__c, p.RequesterNotificationDate__c, p.RecordTypeId, p.ReceiveDateTime__c, p.ProjectType__c, p.ProjectLink__c, p.ProjectDurationDays__c, p.Program__c, p.OwnerId, p.Name__c, p.Name, p.MustBeApproved__c, p.MarkingAssignmentCount__c, p.MarkingAssignmentCompleteCount__c, p.MarkingAssignmentCancelledCount__c, p.MapLocation__c, p.MajorProject__c, p.LastModifiedDate, p.LastModifiedById, p.LastActivityDate, p.IsDeleted, p.Investigator__c, p.Id, p.ITSAssignmentCount__c, p.ITSAssignmentCompleteCount__c, p.ITSAssignmentCancelledCount__c, p.HoursSpent__c, p.HeavyEquipmentAssignmentCount__c, p.HeavyEquipmentAssignmentCompleteCount__c, p.HeavyEquipmentAssignmentCancelledCount__c, p.GeometricProjectType__c, p.GeometricProjectSource__c, p.GeometricPlanNumber__c, p.Geolocation__Longitude__s, p.Geolocation__Latitude__s, p.ElectricalAssignmentCount__c, p.ElectricalAssignmentCompleteCount__c, p.ElectricalAssignmentCancelledCount__c, p.CreatedDate, p.CreatedById, p.CouncilDistrict__c, p.Coordinator__c, p.Concern__c, p.CompleteDateTime__c, p.ChargeNumber__c, p.ApprovalStatus__c From Project__c p";
	
	//--------------------END OF EDITABLE FIELDS--------------------------

	init = function initializeMap(options) {
		var esriLayer;

		sforce.connection.sessionId = options.SessionID;

		esriLayer = L.esri.basemapLayer('Topographic');
		map = L.map( options.div ,{layers: esriLayer}).setView([37.33766995, -121.8874011], 16);
		map.scrollWheelZoom.disable();
		map.on('focus', function() { map.scrollWheelZoom.enable(); });
		map.on('blur', function() { map.scrollWheelZoom.disable(); });

		
		var records = sforce.connection.query(projQuery);
		records1 = records.getArray('records');

		if (options.projectsLayer){
			createProjMarkers(records1);
		}

		if (options.search){
			new L.Control.GoogleAutocomplete().addTo(map);
		}

		if (options.layerMenu){
			L.control.layers({
				'Esri': esriLayer
			}, {
				'Projects': projects
			}, {position: 'topright', collapsed: false}).addTo(map);
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
		if (options.esriSet){

			var streetlightWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/StreetlightUpdate/FeatureServer/0'; //MUST be https for salesforce to accept
			var privateStreetsURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/private_streets/FeatureServer/0';
			var incorporatedWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/incorporated_areas_mask/FeatureServer/0';
			var gflandscapeWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/landscaping_city_all/FeatureServer/3';
			var sdlandscapeWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/landscaping_city_all/FeatureServer/1';
			var councilWFSURL = 'https://services2.arcgis.com/KCFBdu4OIPKQGsVV/arcgis/rest/services/council/FeatureServer/0';

			var privateStreets = L.esri.featureLayer({
				url: privateStreetsURL,
				minZoom: 17,
				maxZoom: 19,
				style : function (feature){
					return { color: '#b3b3cc',opacity: 0.75, weight: 5 };
				}
			}).addTo(map);        
       		// END PRIVATE STREETS

        	//add a WFS incorporated
        	incorporatedLayer('add', 'black'); //added by this special function to allow change color dynamically

        	//add a WFS gflandscape
        	var gflandscape = L.esri.featureLayer({
        		url: gflandscapeWFSURL,
        		simplifyFactor: 0.5,
        		precision: 6,
            	//fillColor: 'black',
            	color: 'green',
            	weight: 1.8,
            	minZoom: 16,
            	maxZoom: 19
            }).addTo(map);

        	//Popup for gflandscape
        	gflandscape.bindPopup(function (feature) {
        		return L.Util.template('General Fund Landscaping', feature.properties);
        	});

        	//add a WFS sdlandscape
        	var sdlandscape = L.esri.featureLayer({
        		url: sdlandscapeWFSURL,
        		simplifyFactor: 0.5,
        		precision: 6,
            	//fillColor: 'black',
            	color: 'blue',
            	weight: 1.8,
            	minZoom: 16,
            	maxZoom: 19
            }).addTo(map);

        	//Popup for sdlandscape
        	sdlandscape.bindPopup(function (feature) {
        		return L.Util.template('Special Districts Landscaping', feature.properties);
        	});
        }
        // -------------------- END ESRI OPTIONS ---------------------- //
    } 

    function makeIcon(type, status, focus){
    	if (options.error){ //error checking
    		console.log(type + "  " + status + "  " + focus)
    	}
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
    	myIcon = L.divIcon({
    		html:pic,
    		iconSize: new L.Point(50, 50),
    		iconAnchor: new L.Point(25, 50),
    		popupAnchor: new L.Point(0, -50)
    	});
    }

    function createProjMarkers(records){
    	var filter = false;
    	if (options.startDate != undefined && options.endDate != undefined){
    		filter = true;
    	}

    	customMarker = L.Marker.extend({
    		options: { 
    			allData: "",
    		}
    	});

    	for (var i = 0; i < records.length; i++){
    		if (filter){
    			if (records[i].CreatedDate.substring(0,10) > options.endDate.yyyymmdd() && records[i].CreatedDate.substring(0,10) < options.startDate.yyyymmdd()){ //checks if markers fall between date range.
    				makeIcon(records[i].ProjectType__c, records[i].Status__c, false);
    	// 			myIcon = L.icon({
    	// 				iconUrl: 'https://i.imgur.com/IiO1b0k.png',
					// 	iconSize: [40, 40], // size of the icon
					// 	iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
					// 	popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor   
					// });
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
				} 
			} else {
				if (records[i].StandardizedLocation__c === options.location){
					makeIcon(records[i].ProjectType__c, records[i].Status__c, false);
    	// 			myIcon = L.icon({
    	// 				iconUrl: 'https://i.imgur.com/Jk4Naws.png',
					// 	iconSize: [40, 40], // size of the icon
					// 	iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
					// 	popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor   
					// });
				} else {
					makeIcon(records[i].ProjectType__c, records[i].Status__c, false);
    	// 			myIcon = L.icon({
    	// 				iconUrl: 'https://i.imgur.com/IiO1b0k.png',
					// 	iconSize: [40, 40], // size of the icon
					// 	iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
					// 	popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor   
					// });
				}    			

				var marker = new customMarker([records[i].Geolocation__Latitude__s, records[i].Geolocation__Longitude__s], {icon: myIcon, allData: records[i]})
				.bindPopup( records[i].Name__c + "" )
				.on('click', function () {
					this.bounce(2.5);
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
			}


		}
		var projects = L.layerGroup(projectArray);
		projects.addTo(map);
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
        }
        if(active == "change_color") {
        	overlayIncorporated.setStyle({fillColor: color});  
        }        
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
		div2.setAttribute('src', 'https://i.imgur.com/u1MkOm8.png');
		div2.setAttribute('class', 'draggable-marker');
		document.body.appendChild(div1);
		document.getElementById("marker-menu").appendChild(div2);

		// The position of the marker icon
		var posTop = $( '.draggable-marker' ).css( 'top' ),
		posLeft = $( '.draggable-marker' ).css( 'left' );
		var mouseMarkerPosX;
		var mouseMarkerPosY;
		$( '.draggable-marker' ).draggable({
			start: function (e, ui ){

				// mouse position on marker
				var offset = $( '.draggable-marker' ).offset(); 
				mouseMarkerPosX = event.clientX - offset.left;
				mouseMarkerPosY = event.clientY - offset.top;
			},

			stop: function ( e, ui ) {
				// returning the icon to the menu
				$( '.draggable-marker' ).css( 'top', posTop );
				$( '.draggable-marker' ).css( 'left', posLeft );

				var coordsX = event.clientX - 16 - mouseMarkerPosX;
				var coordsY = event.clientY - 128 - mouseMarkerPosY;
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
			iconUrl: 'https://i.imgur.com/u1MkOm8.png', // the url of the img
			iconSize: [64, 64],
			iconAnchor: [32, 64] // the coordinates of the "tip" of the icon ( in this case must be ( icon width/ 2, icon height )
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
	 (function($, undefined) {
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
	 			var $controlContainer = $(map._controlContainer);

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

	 			$(searchwrapper).append(this._searchbox);
	 			$(this._container).append(searchwrapper, this._closetomebox);


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
	 					$('leaflet-control-googleautocomplete-qry').addClass('notfound');
	 					return;
	 				}

	 				if (place.geometry.location) {
	 					$('leaflet-control-googleautocomplete-qry').removeClass('notfound');
						processLocation(place.geometry.location.lng(), place.geometry.location.lat(), place.name, place.address_components, null); //this is going to main script area. passed variable is (x,y) for later parsing.
						searchbox.value = searchbox.value.replace(", United States","");//remove 'United States' because it is superfluous
					}
				});   

	 			$(searchbox).keypress(function(e) {
					if(e.which == 13) { //if a number is entered into the searchbox, it will attempt to find the shopNo instead. INCOMPLETE UNTIL SHOP DB IS IMPORTED
						var geocoder;
						geocoder = new google.maps.Geocoder();
						if (searchbox.value[0] == '#'){
							//console.log("NUMBER!!!");
							var shopNum = searchbox.value.substring(1);
							var shopQuery = "Select s.IntersectionName__c, s.Id, s.GeolocationY__c, s.GeolocationX__c From ShopNumber__c s WHERE ShopNumber__c = " + shopNum;
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
									createDragMarker(results[0].geometry.location.lat(), results[0].geometry.location.lng());
									//googleReverseGeocode(results[0].geometry.location.lng(), results[0].geometry.location.lat(), false);
									processLocation(results[0].geometry.location.lng(), results[0].geometry.location.lat(), toTitleCase(shopRecords1[0].IntersectionName__c) , results[0].address_components, shopNum);
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
	init(options);
}

	//END GOOGLE AUTO COMPLETE SCRIPT
	if (options != undefined){	
		init(options);
	}
})

