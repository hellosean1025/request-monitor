require('babel-register')

require('core-js/es6/map')
require('core-js/es6/set')
require('raf/polyfill')



global.document = require('jsdom').jsdom('<body></body>')
global.window = document.defaultView
global.navigator = window.navigator

global.fetch = window.fetch = require('node-fetch');
global.XMLHttpRequest = global.window.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
