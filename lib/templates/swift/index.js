/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.swiftType = swiftType;
exports.render = render;
exports.additionalFiles = additionalFiles;

var _models = require('../../models');

var nodePath = require('path');
var co = require('co');
var fs = require('mz/fs');
var fw = nodePath.resolve(__dirname, 'reflectable.hbs');

function swiftType(type) {
    var ai = _models.AttributeIdentifier;
    switch (type.identifier) {
        case ai.Custom:
            return type.value;
        case ai.Reference:
            return type.reference;
        case ai.Id:
            return "Int";
        default:
            return type.name;
    }
}

function render(model) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return co(function* () {
        var value = {
            name: model.name,
            initializers: [],
            options: options,
            comments: model.comments
        };
        var required = [];
        value.attributes = model.attributes.map(function (attr) {
            var req = !! ~attr.modifiers.indexOf('required');
            var readonly = !! ~attr.modifiers.indexOf('readonly');
            var tname = swiftType(attr.type);
            var type = attr.repeated ? '[' + tname + ']' : tname;
            type += req || attr.repeated ? '' : '?';
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
                readonly: readonly,
                comments: attr.comments
            };
        });
        var rinit = required.map(function (m) {
            return m.name + ': ' + m.type;
        });
        value.initializers.push({
            params: rinit.join(', '),
            body: required.map(function (m) {
                return 'self.' + m.name + ' = ' + m.name;
            }).join('\n    ')
        });
        value.initializers.push({
            params: value.attributes.map(function (m) {
                return m.name + ': ' + m.type;
            }).join(', '),
            body: value.attributes.map(function (m) {
                return 'self.' + m.name + ' = ' + m.name;
            }).join('\n    ')
        });
        return {
            extension: '.swift',
            content: yield compile(nodePath.join(__dirname, 'template.hbs'), value)
        };
    });
}

function* additionalFiles() {
    return [{
        name: 'Reflectable.swift',
        content: yield fs.readFile(fw, 'utf8')
    }];
}