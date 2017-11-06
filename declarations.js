	var DOTDeclarations = true;

	//---------EDITABLE FIELDS, MAKE CHANGES AS NESSESSARY--------------

	//Marker Icon HTML - BASE ICON COLOR MUST BE BLUE, OTHERWISE HUE SUFFIXES MUST BE CHANGED.
	var signalsProjMarker = '<img alt="Signal Project" src="https://i.imgur.com/Gfa1Ez0.png" title="Signal Project"';
	var signalsGeometricMarker = '<img alt="Geometric Project" src="https://i.imgur.com/DDMM4qR.png" title="Geometric Project"';
	var signalsTrafficCalmingMarker = '<img alt="Traffic Calming Project" src="https://i.imgur.com/PAQFjPy.png" title="Traffic Calming Project"';

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
	var shopQuery = "Select s.Name, s.IntersectionName__c, s.Id, s.Geolocation__Longitude__s, s.Geolocation__Latitude__s From ShopNumber__c s";

	//Query at 'GOOGLE AUTOCOMPLETE SCRIPT' (tentatively around line 558) to use search box to find Shop.
	var shopSearchQuery = "Select s.IntersectionName__c, s.Id, s.GeolocationY__c, s.GeolocationX__c From ShopNumber__c s WHERE ShopNumber__c = ";

	//Select All SOQL Query. Change this if fields get added/removed from Projects
	var projQuery = "Select p.ZipCode__c, p.TrafficImpacted__c, p.TrafficCalmingRequestType__c, p.TrafficCalmingProjectType__c, p.TrafficCalmingConcernType__c, p.TrafficCalmingConcernItem__c, p.SystemModstamp, p.Summary__c, p.Status__c, p.StandardizedLocation__c, p.SignalTimeOfDay__c, p.SignalSideOfStreet__c, p.SignalProjectType__c, p.SignalProblemDirection__c, p.SignalOperationAssignmentCount__c, p.SignalOperationAssignmentCompleteCount__c, p.SignalOperationAssignmentCancelledCount__c, p.SignalFundAdjustment__c, p.SignalDesignAssignmentCount__c, p.SignalDesignAssignmentCompleteCount__c, p.SignalDesignAssignmentCancelledCount__c, p.SignalDayOfWeek__c, p.SignalCustomerSurveySent__c, p.SignAssignmentCount__c, p.SignAssignmentCompleteCount__c, p.SignAssignmentCancelledCount__c, p.School__c, p.RequesterNotificationDate__c, p.RelatedShop__c, p.RecordTypeId, p.ReceiveDateTime__c, p.ProjectType__c, p.ProjectDurationDays__c, p.Program__c, p.OwnerId, p.Name__c, p.Name, p.MustBeApproved__c, p.MarkingAssignmentCount__c, p.MarkingAssignmentCompleteCount__c, p.MarkingAssignmentCancelledCount__c, p.MapLocation__c, p.MajorProject__c, p.LastModifiedDate, p.LastModifiedById, p.LastActivityDate, p.IsDeleted, p.Investigator__c, p.Id, p.ITSAssignmentCount__c, p.ITSAssignmentCompleteCount__c, p.ITSAssignmentCancelledCount__c, p.HoursSpent__c, p.HeavyEquipmentAssignmentCount__c, p.HeavyEquipmentAssignmentCompleteCount__c, p.HeavyEquipmentAssignmentCancelledCount__c, p.GeometricProjectType__c, p.GeometricProjectSource__c, p.GeometricPlanNumber__c, p.Geolocation__Longitude__s, p.Geolocation__Latitude__s, p.ElectricalAssignmentCount__c, p.ElectricalAssignmentCompleteCount__c, p.ElectricalAssignmentCancelledCount__c, p.CreatedDate, p.CreatedById, p.CouncilDistrict__c, p.Coordinator__c, p.Concern__c, p.CompleteDateTime__c, p.ChargeNumber__c, p.ApprovalStatus__c From Project__c p";
	
	//--------------------END OF EDITABLE FIELDS--------------------------

	if (options.error){
		console.log("new Declarations are loaded");
	}