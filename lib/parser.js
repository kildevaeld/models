/// <reference path="../typings/parser.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.parseString = parseString;
exports.parseFile = parseFile;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var nodePath = _interopRequireWildcard(_path);

var _models = require('./models');

var _tokenizer = require('./tokenizer');

var _tokenizer2 = _interopRequireDefault(_tokenizer);

var fs = require('mz/fs'),
    co = require('co');
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}
function stringToType(type) {
    var attr = undefined;
    var id = _models.AttributeIdentifier[capitalize(type.name)];
    if (type.type === 'builtin') {
        attr = new _models.AttributeBuiltinType(id);
    } else if (type.type === 'custom') {
        attr = new _models.AttributeCustomType(_models.AttributeIdentifier.Custom, { value: type.name });
    } else if (type.type === 'reference') {
        attr = new _models.AttributeReferenceType(_models.AttributeIdentifier.Reference, { reference: type.name });
    }
    return attr;
}
function JSONToIModel(model) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = model.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attr = _step.value;

            var type = stringToType(attr.type);
            attr.type = type;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return model;
}

function parseString(str) {
    var models = _tokenizer2['default'].parse(str, {
        output: 'source'
    });
    if (models === null) return;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = models[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var model = _step2.value;

            JSONToIModel(model);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return models;
}

function parseFile(path) {
    var extname = nodePath.extname(path);
    return co(function* () {
        var models = undefined;
        var data = yield fs.readFile(path, 'utf8');
        switch (extname) {
            case '.model':
                models = _tokenizer2['default'].parse(data, {
                    output: 'source'
                });
                break;
            case ('.cson', '.json'):
            default:
                models = null;
        }
        if (models === null) return;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = models[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var model = _step3.value;

                JSONToIModel(model);
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return models;
    });
}