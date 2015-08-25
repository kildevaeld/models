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
    var ai = _models.AttributeIdentifier;
    switch (type.identifier) {
        case ai.Custom:
            return type.value;
        case ai.Reference:
            return '*' + type.reference;
        case ai.Id:
            return "int";
        default:
            return type.name.toLowerCase();
    }
}

function render(model) {
    return co(function* () {
        var value = {
            name: model.name,
            initializers: [],
            comments: model.comments,
            'package': model['package']
        };
        var required = [];
        value.attributes = model.attributes.map(function (attr) {
            var req = !! ~attr.modifiers.indexOf('required');
            var tname = goType(attr.type);
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