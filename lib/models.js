"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AttributeIdentifier;
exports.AttributeIdentifier = AttributeIdentifier;
(function (AttributeIdentifier) {
    AttributeIdentifier[AttributeIdentifier["UInt64"] = 0] = "UInt64";
    AttributeIdentifier[AttributeIdentifier["UInt32"] = 1] = "UInt32";
    AttributeIdentifier[AttributeIdentifier["UInt16"] = 2] = "UInt16";
    AttributeIdentifier[AttributeIdentifier["UInt8"] = 3] = "UInt8";
    AttributeIdentifier[AttributeIdentifier["Int64"] = 4] = "Int64";
    AttributeIdentifier[AttributeIdentifier["Int32"] = 5] = "Int32";
    AttributeIdentifier[AttributeIdentifier["Int16"] = 6] = "Int16";
    AttributeIdentifier[AttributeIdentifier["Int8"] = 7] = "Int8";
    AttributeIdentifier[AttributeIdentifier["Int"] = 8] = "Int";
    AttributeIdentifier[AttributeIdentifier["UInt"] = 9] = "UInt";
    AttributeIdentifier[AttributeIdentifier["Float"] = 10] = "Float";
    AttributeIdentifier[AttributeIdentifier["Double"] = 11] = "Double";
    AttributeIdentifier[AttributeIdentifier["String"] = 12] = "String";
    AttributeIdentifier[AttributeIdentifier["Id"] = 13] = "Id";
    AttributeIdentifier[AttributeIdentifier["Boolean"] = 14] = "Boolean";
    AttributeIdentifier[AttributeIdentifier["Reference"] = 15] = "Reference";
    AttributeIdentifier[AttributeIdentifier["Custom"] = 16] = "Custom";
    AttributeIdentifier[AttributeIdentifier["Date"] = 17] = "Date";
    AttributeIdentifier[AttributeIdentifier["Object"] = 18] = "Object";
    AttributeIdentifier[AttributeIdentifier["Model"] = 19] = "Model";
})(AttributeIdentifier || (exports.AttributeIdentifier = AttributeIdentifier = {}));

var AttributeBuiltinType = (function () {
    function AttributeBuiltinType(type, definition) {
        _classCallCheck(this, AttributeBuiltinType);

        this.identifier = type;
        this.definition = definition;
    }

    _createClass(AttributeBuiltinType, [{
        key: "toJSON",
        value: function toJSON() {
            var _this = this;

            var names = Object.getOwnPropertyNames(this);
            var out = {};
            names.forEach(function (name) {
                out[name] = _this[name];
            });
            out.name = this.name;
            return out;
        }
    }, {
        key: "name",
        get: function get() {
            return AttributeIdentifier[this.identifier];
        }
    }]);

    return AttributeBuiltinType;
})();

exports.AttributeBuiltinType = AttributeBuiltinType;

var AttributeReferenceType = (function (_AttributeBuiltinType) {
    _inherits(AttributeReferenceType, _AttributeBuiltinType);

    function AttributeReferenceType(type, options) {
        _classCallCheck(this, AttributeReferenceType);

        _get(Object.getPrototypeOf(AttributeReferenceType.prototype), "constructor", this).call(this, type);
        this.reference = options.reference;
    }

    return AttributeReferenceType;
})(AttributeBuiltinType);

exports.AttributeReferenceType = AttributeReferenceType;

var AttributeCustomType = (function (_AttributeBuiltinType2) {
    _inherits(AttributeCustomType, _AttributeBuiltinType2);

    function AttributeCustomType(type, options) {
        _classCallCheck(this, AttributeCustomType);

        _get(Object.getPrototypeOf(AttributeCustomType.prototype), "constructor", this).call(this, type);
        this.value = options.value;
    }

    return AttributeCustomType;
})(AttributeBuiltinType);

exports.AttributeCustomType = AttributeCustomType;
var Modifier;
exports.Modifier = Modifier;
(function (Modifier) {
    Modifier[Modifier["Required"] = 0] = "Required";
    Modifier[Modifier["Index"] = 1] = "Index";
})(Modifier || (exports.Modifier = Modifier = {}));