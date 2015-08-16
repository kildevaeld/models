/// <reference path="../../typings/tsd.d.ts" />
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.compile = compile;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebars = require('handlebars');

var hbs = _interopRequireWildcard(_handlebars);

var _models = require('../models');

_defaults(exports, _interopExportWildcard(_models, _defaults));

var fs = require('mz/fs');
var handlebars = hbs;
exports.handlebars = handlebars;

function compile(path, locals) {
    return fs.readFile(path, 'utf8').then(function (data) {
        var template = hbs.compile(data);
        return template(locals || {});
    });
}