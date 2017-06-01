# DoT Leaflet Readme

1. Description
2. Requirements, Preparation, and Set-up
3. How to use DoT Leaflet
4. Options, Functions, and other features
5. To-Do List and Comments


## 1.    DESCRIPTION

DoT Leaflet is a pre-customized intermediary toolkit that takes advantage of the Dept of Transportation's Salesforce resources to simplify map implementation. It pre-loads tools for use that, with the set of an option, allows for additional functionality depending on where it is needed.

DoT Leaflet is always a work in progress as more functionality will be always be requested and more unusual cases need to be accounted for.


## 2.    REQUIREMENTS, SET UP, AND PREPARATION

Needless to say, DoT Leaflet is designed to be used almost exclusively for Salesforce. While not locked to Salesforce, the code will need some (very slight) modification to account for non-Visualforce platforms.

Implementation requires that there be an accessible directory to store all the required source files. Github, SVN, or some other repository that can be directly access by means of a singular link 

Example: `https://rawgit.com/alvyn-ly/DoTLeaflet/Release-1.0/main.js`

The developer implementing this toolkit must also have API access and general read capabilities across the intended Salesforce platform.

## 3.    HOW TO USE DOT LEAFLET

Implementation is broken down into three requirements across the Visualforce page the map is being implemented in.

**Early Page Implementation - Including Google Map and Salesforce resources**

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

**Mid Page Implementation - Setting an Options JSON**

DoT Leaflet, upon load, checks for a pre-defined JSON object by the name of `options`.
Simply creating a JSON object in a script tag with an entry for `div` and `SessionID` satisfies all of the requirements for this section, but there are many more options that can be set. We will go over those options in the next section.

The Options JSON implementation will look similar to this:
```javascript
<script type="text/javascript">
  var options = {SessionID:'{!$Api.Session_ID}', div:"mapContainer"};
</script>
```

**End Page Implementation – RequireJS and Div tags**


