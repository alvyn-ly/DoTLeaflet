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
        JQuery_ui: 'empty:',
        LoadCSS: 'LoadCSS',
        DoT_leaflet: 'DoTLeaflet',
        leaflet: 'leaflet',
        esri_leaflet: 'esri_leaflet',
        googleAPI: 'empty:',
        smoothMarkerBouncing: 'smoothMarkerBouncing',
        Leaflet_Google: 'Leaflet_Google'
    },
    shim: {
        'DoT_leaflet': {
            deps: ['leaflet', 'esri_leaflet','Leaflet_Google', 'googleAPI', 'leafletLib']
        },
        'Leaflet_Google': {
            deps: ['googleAPI'] 
        },
        'esri_leaflet': {
            deps: ['leaflet']
        },
        'JQuery_ui': {
            deps: ['JQuery']
        }
    }
})