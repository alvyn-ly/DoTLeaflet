/**
 * @license domReady 2.0.1 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/domReady/LICENSE
 */

define([],function(){"use strict";function n(n){var e;for(e=0;e<n.length;e+=1)n[e](r)}function e(){var e=u;l&&e.length&&(u=[],n(e))}function t(){l||(l=!0,c&&clearInterval(c),e())}function o(n){return l?n(r):u.push(n),o}var d,i,c,a="undefined"!=typeof window&&window.document,l=!a,r=a?document:null,u=[];if(a){if(document.addEventListener)document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1);else if(window.attachEvent){window.attachEvent("onload",t),i=document.createElement("div");try{d=null===window.frameElement}catch(n){}i.doScroll&&d&&window.external&&(c=setInterval(function(){try{i.doScroll(),t()}catch(n){}},30))}"complete"===document.readyState&&t()}return o.version="2.0.1",o.load=function(n,e,t,d){d.isBuild?t(null):o(t)},o});