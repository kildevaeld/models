/// <reference path="../typings/tsd.d.ts" />
import program from 'commander'
import * as parser from './parser'
const nodePath =  require('path')
const co = require('co')
const fs = require('mz/fs')

function errorAndExit(e, code) {
	console.error(e.stack);
	exit(code||1);
}

import * as swift from './templates/swift'
import * as go from './templates/go'

function findTemplate (str?:name) {
	if (str == null) return null
	switch (str) {
		case 'swift': return swift
		case 'go': return go
		default: 
			throw new Error('template not found');
	}
}

interface Model {
	name: string
	content: string
}

const compile = program
.command('compile <file>')
.option('-t, --template <template>')
.option('-c, --concat [filename]')
.option('-o, --out <path>')

compile.action(function (file) {
	try {
		file = nodePath.resolve(process.cwd(), file)	
	} catch (e){
		errorAndExit(e)
	}
	
	let template = compile.template
	let destPath = compile.out
	let concat = compile.concat
	
	co(function *() {
		let json: Model[] = []
		let models = yield parser.parseFile(file);
		let renderer = findTemplate(template);
		for (let i=0;i<models.length;i++) {
			let model = models[i]
			let val
			if (renderer) {
				val = yield renderer.render(model)
			} else {
				val = JSON.stringify(model, null, 2)
			}
			val.name = model.name + val.extension
			json.push(val)
		}
		
		if (renderer.additionalFiles) {
			let val = yield renderer.additionalFiles()
			
			json = val.concat(json)
		}
		
		if (concat) {
			let dest = nodePath.resolve()
			let file = json.map(function (m) {
				
				return m.content
			}).join('\n')
			json = [{name:concat, content:file}]
		}
		
		for (let i=0;i<json.length;i++) {
			let m = json[i]
			if (destPath) {
				let fp = nodePath.resolve(destPath, m.name)
				yield fs.writeFile(fp, m.content)
			} else {
				process.stdout.write(m.content);
			}
			
		}
		
	}).catch(function (e) {
		errorAndExit(e)
	})
	
})

program.parse(process.argv)