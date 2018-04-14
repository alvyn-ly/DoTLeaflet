	var DOTDeclarations = true;

	//---------EDITABLE FIELDS, MAKE CHANGES AS NESSESSARY--------------

	//Marker Icon HTML - BASE ICON COLOR MUST BE BLUE, OTHERWISE HUE SUFFIXES MUST BE CHANGED.
	var signalsProjMarker = '<img alt="Signal Project" src="https://i.imgur.com/Gfa1Ez0.png" title="Signal Project"';
	var signalsGeometricMarker = '<img alt="Geometric Project" src="https://i.imgur.com/DDMM4qR.png" title="Geometric Project"';
	var signalsTrafficCalmingMarker = '<img alt="Traffic Calming Project" src="https://i.imgur.com/PAQFjPy.png" title="Traffic Calming Project"';
	var signalsPSEMarker = '<img alt="Pedestrial Safety Enhancement Project" src="https://i.imgur.com/sRU7wzu.png" title="Pedestrial Safety Enhancement Project"';
	var signalsPavementMarker = '<img alt="Pavement Project" src="https://i.imgur.com/Wx1aYKu.png" title="Pavement Project"';


	var blueHue = '>';
	var greenHue = ' class="huerotateN80">';
	var redHue = ' class="huerotate150">';
	var blackHue = ' class="grayscale">';
	var orangeHue = ' class="huerotate185">';

	var draggableMarker = 'https://i.imgur.com/ARoXSjT.png';
	var miniShopIcon = 'https://i.imgur.com/juXmwnf.png';

	//Integer for the default amount of time the map goes back to look for projects without a specified time filter.
	var defaultTimeFilterOffset = -6;

	//Query for revealing shops at a close zoom.
	var shopQuery = "Select s.Name, s.IntersectionName1__c, s.Id, s.Geolocation__Longitude__s, s.Geolocation__Latitude__s From ShopNumber__c s";

	//Query at 'GOOGLE AUTOCOMPLETE SCRIPT' (tentatively around line 558) to use search box to find Shop.
	var shopSearchQuery = "Select s.Name, s.IntersectionName1__c, s.Id, s.Geolocation__Longitude__s, ShopNumberSortable__c, s.Geolocation__Latitude__s From ShopNumber__c s WHERE ShopNumberSortable__c = ";

	//Select All SOQL Query. Change this if fields get added/removed from Projects
	var projQuery = "Select p.Status__c, p.StandardizedLocation__c, p.ProjectType__c, p.Name__c, p.Name, p.Id, p.Geolocation__Longitude__s, p.Geolocation__Latitude__s, p.CreatedDate, p.Concern__c From Project__c p";
	
	//--------------------END OF EDITABLE FIELDS--------------------------

	if (options.error){
		console.log("new Declarations are loaded");
	}