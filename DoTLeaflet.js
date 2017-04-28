define(['JQuery', 'JQuery_ui', 'leaflet'], function(JQuery) {
	var init;
	var map;
	var markers = [], // an array containing all the markers added to the map
	markersCount = 0; // the number of the added markers
	
	init = function initializeMap(options) {
		var esriLayer;

		sforce.connection.sessionId = options.SessionID;

		esriLayer = L.esri.basemapLayer('Topographic');
		map = L.map( options.div ,{layers: esriLayer}).setView([37.33766995, -121.8874011], 16);

		var projectArray = [];

		var projQuery = "Select p.ZipCode__c, p.TrafficCalmingRequestType__c, p.TrafficCalmingProjectType__c, p.TrafficCalmingConcernType__c, p.TrafficCalmingConcernItem__c, p.TrafficAffected__c, p.SystemModstamp, p.Summary__c, p.Status__c,  p.StandardizedLocation__c, p.SignalTimeOfDay__c, p.SignalSideOfStreet__c, p.SignalProjectType__c, p.SignalProblemDirection__c, p.SignalOperationAssignmentCount__c, p.SignalOperationAssignmentCompleteCount__c, p.SignalFundAdjustment__c, p.SignalDesignAssignmentCount__c, p.SignalDesignAssignmentCompleteCount__c, p.SignalDayOfWeek__c, p.SignalCustomerSurveySent__c, p.SignAssignmentCount__c, p.SignAssignmentCompleteCount__c, p.School__c, p.RequesterNotificationDate__c, p.RecordTypeId, p.ReceiveDateTime__c, p.ProjectType__c, p.ProjectLink__c, p.ProjectDurationDays__c, p.Program__c, p.OwnerId, p.Name__c, p.Name, p.MarkingAssignmentCount__c, p.MarkingAssignmentCompleteCount__c, p.MapLocation__c, p.MajorProject__c, p.LastModifiedDate, p.LastModifiedById, p.LastActivityDate, p.IsDeleted, p.Investigator__c, p.Id, p.ITSAssignmentCount__c, p.ITSAssignmentCompleteCount__c, p.HoursSpent__c, p.HeavyEquipmentAssignmentCount__c, p.HeavyEquipmentAssignmentCompleteCount__c, p.GeometricProjectType__c, p.GeometricProjectSource__c, p.GeometricPlanNumber__c, p.Geolocation__Longitude__s, p.Geolocation__Latitude__s, p.ElectricalAssignmentCount__c, p.ElectricalAssignmentCompleteCount__c, p.CreatedDate, p.CreatedById, p.CouncilDistrict__c, p.Coordinator__c, p.Concern__c, p.CompleteDateTime__c, p.ChargeNumber__c, p.AssignDateTime__c From Project__c p";
		var records = sforce.connection.query(projQuery);
		var records1 = records.getArray('records');

		if (options.projectsLayer){

			customMarker = L.Marker.extend({
				options: { 
					allData: "",
				}
			});
			for (var i = 0; i < records1.length; i++){
				myIcon = L.icon({
					iconUrl: 'https://i.imgur.com/IiO1b0k.png',
					iconSize: [40, 40], // size of the icon
					iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
					popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor   
				});
				var marker = new customMarker([records1[i].Geolocation__Latitude__s, records1[i].Geolocation__Longitude__s], {icon: myIcon, allData: records1[i]})
				.bindPopup( records1[i].Name__c + "" )
				.on('click', function () {
					this.bounce(3);
					//console.log((this.options.allData));
					try {
						pushData(this.options.allData);
					} catch(err) {
						console.log("pushData() cannot be found.")
					}
				});
				projectArray.push(marker);
			}
			var projects = L.layerGroup(projectArray);
			projects.addTo(map);
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
			processLocation(options.lng, options.lat, null, null);
		}
		if (options.zoom != undefined && Number.isInteger(options.zoom)){
			map.setZoom(options.zoom);
		}
	}

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

				var coordsX = event.clientX - mouseMarkerPosX;
				coordsY = event.clientY - 64 - mouseMarkerPosY;
				point = L.point( coordsX, coordsY ), // createing a Point object with the given x and y coordinates
				markerCoords = map.containerPointToLatLng( point ), // getting the geographical coordinates of the point

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
				markers[0] = L.marker( [ markerCoords.lat, markerCoords.lng ], {
					draggable: true,
					icon: myIcon
				}).on('dragend', function(event){
					console.log(markers[0].getLatLng().lat + "  " + markers[0].getLatLng().lng);
					try {
						getDropLocation(markers[0].getLatLng().lat, markers[0].getLatLng().lng);
					} catch (err) {
						console.log("getDropLocation() cannot be found.")
					}
				}).addTo( map );
				console.log(markerCoords.lat + "   " + markerCoords.lng);  
				try {
					getDropLocation(markerCoords.lat, markerCoords.lng);  
				} catch (err) {
					console.log("getDropLocation() cannot be found.")
				}             
				markersCount++;
			}
		});
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
	 * @param addressBox old parameter. Unused.
	 * @param addressComponent old parameter. Unused.
	 **/
	function processLocation(passX, passY, addressBox, addressComponents) {//after the geocode search happens in the autocomplete box, I shut off all the google stuff and instead it just passes the x&y to this function where I can use it in Leaflet.
		map.setView(new L.LatLng(passY, passX), 18);
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
					console.log(autocomplete);
					var place = autocomplete.getPlace();
					if (!place.geometry) {
						$('leaflet-control-googleautocomplete-qry').addClass('notfound');
						return;
					}

					if (place.geometry.location) {
						$('leaflet-control-googleautocomplete-qry').removeClass('notfound');
						processLocation(place.geometry.location.lng(), place.geometry.location.lat(), place.name, place.address_components); //this is going to main script area. passed variable is (x,y) for later parsing.
						searchbox.value = searchbox.value.replace(", United States","");//remove 'United States' because it is superfluous
					}
				});   

				$(searchbox).keypress(function(e) {
					if(e.which == 13) { //if a number is entered into the searchbox, it will attempt to find the shopNo instead. INCOMPLETE UNTIL SHOP DB IS IMPORTED
						var geocoder;
						geocoder = new google.maps.Geocoder();
						if (/^\d+$/.test(searchbox.value)){
							console.log("NUMBER!!!");
							var address = "San Jose State University" + ", San Jose California"
							var boundSW = google.maps.LatLng(37.2134286,-122.0329773);
							var boundNE = google.maps.LatLng(37.4410163,-121.759899);
							var bounds = google.maps.LatLngBounds(boundSW,boundNE);
							geocoder.geocode( {
								address: address,
								bounds: bounds,
								region: 'us'
							}, function(results, status) {
								if (status == google.maps.GeocoderStatus.OK) {
									processLocation(results[0].geometry.location.lng(), results[0].geometry.location.lat(), null , null);
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
									processLocation(results[0].geometry.location.lng(), results[0].geometry.location.lat(), preaddress.replace("&","and").replace("amp;",""),results[0].address_components);
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

	function googleReverseGeocode(passLat, passLng) {
		var geocoder;
		geocoder = new google.maps.Geocoder();
		var latlng = {lat: passLat, lng: passLng};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					googleReverseGeocodeResult(results[0].formatted_address);
				} else {
					//console.log('Reverse location lookup: No results found');
				}
			} else {
				//console.log('Reverse location lookup was not successful for the following reason: ' + status);
			}
		});
	}
	//END GOOGLE AUTO COMPLETE SCRIPT
	if (options != undefined){	
		init(options);
	}
})

