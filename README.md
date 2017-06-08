# DoT Leaflet Readme

![Example Picture](https://i.imgur.com/zroqwWP.png)

1. Description
2. Requirements, Preparation, and Setup
3. How to use DoT Leaflet
4. Options, Functions, and other features
5. To-Do List and Comments


## 1.    Description

DoT Leaflet is a pre-customized intermediary toolkit that takes advantage of the Dept of Transportation's Salesforce resources to simplify Leaflet map implementation. It pre-loads tools for use that, with the set of an option, allows for additional functionality depending on where it is needed.

DoT Leaflet is always a work in progress as more functionality will be always be requested and more unusual cases need to be accounted for.


## 2.    Requirements, Preparations, and Setup

Needless to say, DoT Leaflet is designed to be used almost exclusively for Salesforce. While not locked to Salesforce, the code will need some (very slight) modification to account for non-Visualforce platforms.

Implementation requires that there be an accessible directory to store all the required source files. This may include Github, SVN, or some other repository that can be directly accessed by means of a singular link to that file. 

Example: `https://rawgit.com/alvyn-ly/DoTLeaflet/Release-1.0/main.js`

The developer implementing this toolkit must also have API access and general read capabilities across the intended Salesforce platform.

## 3.    How To Use DoT Leaflet

Implementation is broken down into three requirements across the Visualforce page the map is being implemented in.

### **Early Page Implementation - Including Google Map and Salesforce resources**

To allow for specific functionality to exist within the DoT Leaflet toolkit, we must include with of these resources to pre-emptively enable their support.

Before implementing anything DoT Salesforce related, as a part of the header, or at least before the next step, we want to include these lines of code:

```javascript
<apex:includeScript value="/soap/ajax/15.0/connection.js" />
<apex:includeScript value="/soap/ajax/15.0/apex.js" />
```

These lines will allow for Salesforce API access and enable the use of the Session ID for querying purposes.

```javascript
<script type="text/javascript" src="https://maps.google.com/maps/api/js?libraries=places"></script>
```

This will include the Google Maps API for the purpose of search bar functionality. 
This must be included externally and preemptively due to RequireJS’s lack of support for non-local resources.

### **Mid Page Implementation - Setting an Options JSON**

DoT Leaflet, upon load, checks for a pre-defined JSON object by the name of `options`.
Simply creating a JSON object in a script tag with an entry for `div` and `SessionID` satisfies all of the requirements for this section, but there are many more options that can be set. We will go over those options in the next section.

The Options JSON implementation will look similar to this:
```javascript
<script type="text/javascript">
  var options = {SessionID:'{!$Api.Session_ID}', div:"mapContainer"};
</script>
```
**It is important to note that any direct interactions or modifications done to the map must be done after the DOM is loaded to avoid any race conditions and errors, preferably with `window.onload = function(){}`. Generally there should NOT be any direct DoT Leaflet map interaction as there are declared functions that are safe for use to pull/push info into the map (we will get more into detail about these next section), but if anybody wants to get creative, be warned.**


### **End Page Implementation – RequireJS and Div tags**

To simplify resource management and including all the different JavaScript sources to make DoT Leaflet work, we employ the use of RequireJS to dynamically load the JavaScript resources automatically without having the developer manually add all various JavaScript include tags.

To employ RequireJS (and in turn, all of the other JavaScript resources), a line is added after all of the in-line JavaScript, or at least after the `options` JSON is declared.

```javascript
<script data-main="link/to/main.js" src="link/to/require.js">
</script>
```

Inside the HTML markup, we want to add a new Div that will hold the map. Previously, in the *Mid Page Implementation*, we had the example options look for a Div class named “mapContainer”, so we will use that. It is important to also declare a specific Div size and dimensions, otherwise the Leaflet map will exhibit strange behavior (i.e. not showing up or filling entire page).

```html
<apex:outputPanel layout="block" id="mapContainer" style="height: 400px;" styleClass></apex:outputPanel>

OR

<div class="mapContainer" id="mapContainer" style="height:300px; "></div>
```
## 4. Options, Functions, and Other Features

DoT Leaflet comes with an easily expandable list of options that attempts to cover most if not all use cases it may be found doing. 
In the `options` JSON, the currently available customizations are available and are set by their respective inputs:

***Bolded options have additional functionalities explained in the following section**

Option | Description | Input Type | Required?
:---: | --- | :---: | :---:
SessionID | Salesforce API Session Key | `'{!$Api.Session_ID}'` | Yes
Div | Name of Div Container for Map | String | Yes
**search** | Search bar w/ Street and Shop filter | Boolean | No
route | Routing service with UI, Beta | Boolean | No
layerMenu | Menu to view/manage/change available layers | Boolean | No
**dragMarker** | Drag-able icon to place on location, returns data | Boolean | No
**projectsLayer** | Queries all Projects entries and places on map | Boolean | No
startDate | Limits projectLayer’s search to dates before this time | Date | No
endDate | Limits projectLayer’s search to dates after this time | Date | No
lat | Default starting latitude | Float | No
lng | Default starting longitude | Float | No
zoom | Default zoom setting | Integer | No
location | Current objects location, used to change icon color to differentiate markers. | String | No
esriSet | **-NOT WORKING-** Extra Esri map layers, council zones, streetlights, etc | Boolean | No
error | Enables the console error outputs for debugging purposes | Boolean | No


DoT Leaflet also comes with some reserved function names that can be used to view and/or manipulate data for the developer, allowing for functionality that does not exist in the toolkit to be implemented outside to the developer’s needs.

`passMarkerAddress(address)`: 
 - This is called when Google’s Search Bar reverse-geocodes a Marker’s given set of coordinates and locates a standardized location for that data.
 - An address in the form of a `String` will be passed into this function.

`pushData()`:
 - This is called when the on-click event is triggered on a marker and gives the full set of info related to the marker’s object it represents.
 - A JSON with all the attributes of the marker’s object will be passed into the function.

`getDropLocation()`:
 - This is called when the draggable Marker is placed anywhere on the map, and will give the marker’s coordinates and the marker itself.
 - A Latitude, Longitude, and Marker object will be passed into the function, in that order.

`setAddressInfo()`:
 - This is called when Google Search Bar’s geocoder returns a result depending on what is typed into the Search Bar. It provides the Longitude, Latitude, Address, and Address Components.
 - A Longitude, Latitude, Address, and Address Components will be passed into the function, in that order.

## 5.    To-Do List and Comments

Map To-do List


- Driving Route overlay. Point A to Point B where existing. RESOURCE FOUND, WAITING ON FULL IMPLEMENTATION
- Different Project Layers (Ask Paolo or Robert)
- Icon Templates with color-fill RESOURCE FOUND, WAITING ON IMPLEMENTATION
- Search by Shop (Future)


----------- NEW PROJECT TASKS -----------

- Re-implement the 'click for info' function for markers. Div-markers, preferably.
- Find a fix for the esri special layers.


Credit is given where credit is due, I take no credit for the base resources this toolkit makes use of.
