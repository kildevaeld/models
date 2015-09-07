'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.compile = compile;
exports.tsType = tsType;
exports.render = render;

var _models = require('../../models');

var _microTemplate = require('micro-template');

var nodePath = require('path');
var co = require('co');
var fs = require('mz/fs');

_microTemplate.template.get = function (id) {
    return require('fs').readFileSync(nodePath.resolve(__dirname, './' + id + '.tmpl'), 'utf-8');
};

function compile(path, locals) {
    return (0, _microTemplate.template)('template', locals);
}

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
            return 'Number';
        case ai.Id:
            return 'Schema.Types.ObjectId';
        default:
            return _models.AttributeIdentifier[type.identifier];
    }
}

function mapAttributes(attrs, references) {
    return attrs.map(function (m) {
        if (m.type instanceof _models.AttributeReferenceType) {
            m.reference = m.type.reference;
            references.push(m.type.reference);
        }
        if (m.type.definition) m.attributes = mapAttributes(m.type.definition, references);
        m.type = tsType(m.type);
        m.access = m.access || 'public';
        m.readonly = !! ~m.modifiers.indexOf('readonly');
        m.required = !! ~m.modifiers.indexOf('required');
        m.index = !! ~m.modifiers.indexOf('index');
        if (m.validations) {
            m.validations = m.validations.map(function (v) {
                if (v.name == 'regexp') {
                    v.args = '/' + v.args[0] + '/' + v.args[1];
                    v.name = "isRegExp";
                } else if (v.args) {
                    v.args = "[" + v.args.map(function (a) {
                        return (/[0-9]+/.test(a) ? a : '"' + a + '"'
                        );
                    }).join(', ') + "]";
                } else {
                    v.name = "is" + v.name == 'url' ? 'URL' : v.name.capitalize();
                }
                return v;
            }).filter(function (x) {
                return x !== null;
            });
            if (!m.validations.length) m.validations = void 0;
        }
        return m;
    });
}

function render(model) {
    return co(function* () {
        var value = model;
        var required = [];
        var references = [];
        value.attributes = mapAttributes(value.attributes, references);
        value.references = references;
        var rendered = (0, _microTemplate.template)('template', value);
        return {
            extension: '.js',
            content: rendered
        };
    });
}