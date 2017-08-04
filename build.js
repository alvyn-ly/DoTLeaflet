({
    appDir: './',
    baseUrl: './',
    dir: './dist',
    modules: [
    {
        name: 'main'
    }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/, 
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        leafletLib: 'leafletLib',
        JQuery: 'JQuery',
        JQuery_ui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min',
        LoadCSS: 'LoadCSS',
        DoT_leaflet: 'DoTLeaflet',
        leaflet: 'leaflet',
        esri_leaflet: 'esri_leaflet',
        googleAPI: '//maps.googleapis.com/maps/api/js?key=AIzaSyBimi-uaVPiKmbW53QUc61AOkzflR0XzZs&sensor=false&libraries=places',
        smoothMarkerBouncing: 'smoothMarkerBouncing',
        Leaflet_Google: 'Leaflet_Google',
        easyButton: 'easy-button',
        oms: 'oms'
    },
    shim: {
        'oms': {
            deps: ['googleAPI', 'leaflet']
        },
        'DoT_leaflet': {
            deps: ['oms', 'easyButton', 'leaflet', 'esri_leaflet','Leaflet_Google', 'googleAPI', 'leafletLib']
        },
        'Leaflet_Google': {
            deps: ['googleAPI'] 
        },
        'esri_leaflet': {
            deps: ['leaflet']
        },
        'easyButton': {
            deps: ['leaflet']
        },
        'JQuery_ui': {
            deps: ['JQuery']
        }
    }
})