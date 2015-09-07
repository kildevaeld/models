'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _templatesSwift = require('./templates/swift');

var swift = _interopRequireWildcard(_templatesSwift);

var _templatesGo = require('./templates/go');

var go = _interopRequireWildcard(_templatesGo);

var _templateTypescript = require('./template/typescript');

var typescript = _interopRequireWildcard(_templateTypescript);

var _templateMongoose = require('./template/mongoose');

var mongoose = _interopRequireWildcard(_templateMongoose);

var nodePath = require('path');
var co = require('co');
var fs = require('mz/fs');
function errorAndExit(e, code) {
    console.error(e.stack);
    process.exit(code || 1);
}

function findTemplate(str) {
    if (str == null) return null;
    switch (str) {
        case 'swift':
            return swift;
        case 'go':
            return go;
        case 'typescript':
        case 'ts':
            return typescript;
        case 'mongoose':
            return mongoose;
        default:
            throw new Error('template not found');
    }
}
_commander2['default'].option('-l, --list-templates');
var compileCmd = _commander2['default'].command('compile <file>').option('-t, --template <template>').option('-c, --concat [filename]').option('-o, --out <path>');
function asyncGlob(str) {
    return new Promise(function (resolve, reject) {
        (0, _glob2['default'])(str, function (e, files) {
            if (e) return reject(e);
            files = files.map(function (file) {
                return nodePath.resolve(process.cwd(), file);
            });
            resolve(files);
        });
    });
}
function* compile(file, renderer) {
    var json = [];
    var models = yield parser.parseFile(file);
    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        var val = undefined;
        if (renderer) {
            val = yield renderer.render(model);
        } else {
            val = {
                content: JSON.stringify(model, null, 2),
                extension: '.json'
            };
        }
        val = {
            name: model.name + val.extension,
            content: val.content
        };
        json.push(val);
    }
    return json;
}
compileCmd.action(function (globPattern) {
    var template = compileCmd.template,
        destPath = compileCmd.out,
        concat = compileCmd.concat;
    co(function* () {
        var files = yield asyncGlob(globPattern);
        var renderer = findTemplate(template);
        var json = [],
            file = undefined,
            i = undefined;
        for (i = 0; i < files.length; i++) {
            var filePath = files[i];
            file = yield compile(filePath, renderer);
            json = json.concat(file);
        }
        if (renderer && renderer.additionalFiles) {
            var val = yield renderer.additionalFiles();
            json = val.concat(json);
        }
        if (concat) {
            var _file = json.map(function (m) {
                return m.content;
            });
            if (renderer) {
                _file = _file.join('\n');
            } else {
                _file = JSON.stringify(JSON.parse('[' + _file.join(',') + ']'), null, 2);
            }
            json = [{ name: concat, content: _file }];
        }
        for (var _i = 0; _i < json.length; _i++) {
            var m = json[_i];
            if (destPath) {
                var fp = nodePath.resolve(destPath, m.name);
                yield fs.writeFile(fp, m.content + '\n');
            } else {
                process.stdout.write(m.content + '\n');
            }
        }
    })['catch'](function (e) {
        errorAndExit(e);
    });
});
var lint = _commander2['default'].command('lint <file>');
lint.action(function (file) {});
_commander2['default'].action(function () {
    console.log('rapra');
});
_commander2['default'].command('*').action(function () {
    console.log('dette');
});
_commander2['default'].parse(process.argv);