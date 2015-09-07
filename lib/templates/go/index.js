/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.compile = compile;
exports.goType = goType;
exports.render = render;

var _models = require('../../models');

var _microTemplate = require('micro-template');

var nodePath = require('path');
var co = require('co');
var fs = require('fs');

_microTemplate.template.get = function (id) {
    return require('fs').readFileSync(nodePath.resolve(__dirname, './' + id + '.tmpl'), 'utf-8');
};

function compile(path, locals) {
    return (0, _microTemplate.template)('template', locals);
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substr(1);
};

function goType(type) {
    var map = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var ai = _models.AttributeIdentifier;
    switch (type.identifier) {
        case ai.Custom:
            var val = type.value;
            return map[val] || val;
        case ai.Reference:
            return '*' + type.reference;
        case ai.Id:
            return "uint";
        case ai.Date:
            return "*time.Time";
        default:
            return type.name.toLowerCase();
    }
}

function render(model) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return co(function* () {
        var value = {
            name: model.name,
            initializers: [],
            comments: model.comments,
            'package': model['package']
        };
        var required = [];
        var objects = [];
        value.attributes = model.attributes.map(function (attr) {
            var req = !! ~attr.modifiers.indexOf('required');
            var tname = goType(attr.type, options.map);
            var type = attr.repeated ? '[]' + tname : tname;
            type = (req || attr.repeated ? '' : '*') + type;
            if (req) {
                required.push({
                    name: attr.name,
                    type: tname,
                    comments: attr.comments,
                    json: attr.name
                });
            }
            if (attr.type.identifier === _models.AttributeIdentifier.Object) {
                objects.push({
                    name: model.name + attr.name.capitalize()
                });
            }
            return {
                name: attr.access === 'private' ? attr.name : attr.name.capitalize(),
                type: type,
                required: req,
                comments: attr.comments,
                json: attr.name,
                readonly: ! ~ ~attr.modifiers.indexOf('readonly')
            };
        });
        var rinit = required.map(function (m) {
            return m.name + ': ' + m.name + ',';
        });
        value.params = required.map(function (m) {
            return m.name + ' ' + m.type;
        });
        value.body = rinit.join('\n    ');
        var rendered = compile('template', value);
        return {
            extension: '.go',
            content: rendered.replace(/^(\s)*([\r\\n]{2,})*/gm, '$1')
        };
    });
}