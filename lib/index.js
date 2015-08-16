'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _parser = require('./parser');

var parser = _interopRequireWildcard(_parser);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _templatesSwift = require('./templates/swift');

var swift = _interopRequireWildcard(_templatesSwift);

var _templatesGo = require('./templates/go');

var go = _interopRequireWildcard(_templatesGo);

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
        default:
            throw new Error('template not found');
    }
}
var compile = _commander2['default'].command('compile <file>').option('-t, --template <template>').option('-c, --concat [filename]').option('-o, --out <path>');
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
compile.action(function (file) {
    /*try {
        file = nodePath.resolve(process.cwd(), file)
    } catch (e){
        errorAndExit(e)
    }*/
    var template = compile.template;
    var destPath = compile.out;
    var concat = compile.concat;
    co(function* () {
        var files = yield asyncGlob(file);
        console.log(files);
        return files;
        var json = [];
        var models = yield parser.parseFile(file);
        var renderer = findTemplate(template);
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
        if (renderer && renderer.additionalFiles) {
            var val = yield renderer.additionalFiles();
            json = val.concat(json);
        }
        if (concat) {
            var dest = nodePath.resolve();
            var _file = json.map(function (m) {
                return m.content;
            }).join('\n');
            json = [{ name: concat, content: _file }];
        }
        for (var i = 0; i < json.length; i++) {
            var m = json[i];
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
_commander2['default'].parse(process.argv);