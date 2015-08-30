/// <reference path="../typings/tsd.d.ts" />
import program from 'commander'
import * as parser from './parser'
import {File} from './templates/template'
import glob from 'glob'
const nodePath =  require('path')
const co = require('co')
const fs = require('mz/fs')

function errorAndExit(e, code?) {
	console.error(e.stack);
	process.exit(code||1);
}

import * as swift from './templates/swift'
import * as go from './templates/go'
import * as typescript from './template/typescript'

function findTemplate (str?:name) {
	if (str == null) return null
	switch (str) {
		case 'swift': return swift
		case 'go': return go
		case 'typescript':
		case 'ts': return typescript
		default:
			throw new Error('template not found');
	}
}

interface Model {
	name: string
	content: string
}

program.option('-l, --list-templates')

const compileCmd = program
//.description('Generate models')
.command('compile <file>')
.option('-t, --template <template>')
.option('-c, --concat [filename]')
.option('-o, --out <path>');

function asyncGlob(str:string): Promise<any> {
	return new Promise(function (resolve, reject) {
		glob(str, function (e, files) {
			if (e) return reject(e);

			files = files.map(function (file) {
				return nodePath.resolve(process.cwd(), file);
			})

			resolve(files)
		})
	});
}


function * compile (file: string, renderer?:any): File[] {
	
	let json: Model[] = [];
	let models = yield parser.parseFile(file);
	
	for (let i=0;i<models.length;i++) {
			let model = models[i]
			let val
			if (renderer) {
				val = yield renderer.render(model)
			} else {
				val = {
					content: JSON.stringify(model, null, 2),
					extension: '.json'
				}
			}
			
			val = {
				name: model.name + val.extension,
				content: val.content
			}

			json.push(val)
	}
	
	return json;
}

compileCmd.action(function (globPattern) {

	
	let template = compileCmd.template,
			destPath = compileCmd.out,
			concat = compileCmd.concat

	co(function *() {
		
		let files = yield asyncGlob(globPattern)
	
		let renderer = findTemplate(template);
		
		
		let json: File[] = [], file: File, i;
		
		for (i=0;i<files.length;i++) {
			let filePath = files[i];
			
			file = yield compile(filePath, renderer)
			
			json = json.concat(file)
			
		}
		

		if (renderer && renderer.additionalFiles) {
			let val = yield renderer.additionalFiles()

			json = val.concat(json)
		}

		if (concat) {
			
			let file = json.map(function (m) {
				return m.content
			});
			
			if (renderer) {
				file = file.join('\n');
			} else {
				file = JSON.stringify(JSON.parse('['+file.join(',')+']'),null,2);
			}
			
			json = [{name:concat, content:file}]
		}
		
		
		for (let i=0;i<json.length;i++) {
			let m = json[i]
			if (destPath) {
				let fp = nodePath.resolve(destPath, m.name)
				yield fs.writeFile(fp, m.content + '\n')
			} else {
				process.stdout.write(m.content + '\n');
			}

		}

	}).catch(function (e:Error) {
		errorAndExit(e)
	})

})

const lint = program.command('lint <file>');

lint.action(function (file) {

});

program.action(function () {
	console.log('rapra')
})

program.command('*')
.action(function () {
	console.log('dette')
})

program.parse(process.argv)
