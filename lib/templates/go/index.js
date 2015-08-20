/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.goType = goType;
exports.render = render;

var _models = require('../../models');

var _template = require('../template');

var nodePath = require('path');
var co = require('co');
var fs = require('mz/fs');

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
                    type: tname
                });
            }
            return {
                name: attr.name,
                type: type,
                required: req,
                comments: attr.comments
            };
        });
        var rinit = required.map(function (m) {
            return m.name + ': ' + m.name + ',';
        });
        value.params = required.map(function (m) {
            return m.name + ': ' + m.type;
        });
        value.body = rinit.join('\n    ');
        return {
            extension: '.go',
            content: yield (0, _template.compile)(nodePath.join(__dirname, 'template.hbs'), value)
        };
    });
}