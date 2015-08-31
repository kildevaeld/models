'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.tsType = tsType;
exports.render = render;

var _models = require('../../models');

var _template = require('../template');

var nodePath = require('path');
var co = require('co');
var fs = require('mz/fs');

function tsType(type) {
    var ai = _models.AttributeIdentifier;
    switch (type.identifier) {
        case ai.Custom:
            return type.value;
        case ai.Reference:
            return type.reference;
        case ai.UInt64:
        case ai.UInt32:
        case ai.UInt16:
        case ai.UInt8:
        case ai.Int64:
        case ai.Int32:
        case ai.Int16:
        case ai.Int8:
        case ai.Float:
        case ai.Double:
        case ai.Id:
            return 'number';
        default:
            return _models.AttributeIdentifier[type.identifier].toLowerCase();
    }
}

function render(model) {
    return co(function* () {
        var value = model;
        var required = [];
        value.attributes = value.attributes.map(function (m) {
            if (m.type instanceof _models.AttributeReferenceType) {
                m.reference = m.type.reference;
            }
            m.type = tsType(m.type);
            m.access = m.access || 'public';
            m.readonly = !! ~m.modifiers.indexOf('readonly');
            m.required = !! ~m.modifiers.indexOf('required');
            if (m.required) {
                required.push(m.name + ':' + m.type);
            }
            return m;
        });
        value.init = required;
        return {
            extension: '.ts',
            content: yield (0, _template.compile)(nodePath.join(__dirname, 'template.hbs'), value)
        };
    });
}