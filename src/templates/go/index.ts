/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />

import {IModel,IAttribute, AttributeIdentifier, IAttributeType, AttributeCustomType, AttributeReferenceType} from '../../models'
import {TemplateFunc, TemplateResult, File} from '../template'
const nodePath = require('path');
const co = require('co');
const fs = require('fs')
import {template} from 'micro-template'

template.get = function (id) {

	return require('fs').readFileSync(nodePath.resolve(__dirname,'./' + id + '.tmpl'), 'utf-8')

};


export function compile(path:string, locals?:any): Promise<string> {
	return template('template', locals);
}


//let fw = nodePath.resolve(__dirname,'reflectable.hbs')
String.prototype.capitalize = function (): string {
	return this.charAt(0).toUpperCase() + this.substr(1);
}


export function goType (type: IAttributeType, map:any={}): string {
	let ai = AttributeIdentifier
	switch (type.identifier) {
		case ai.Custom:
			var val = (<AttributeCustomType>type).value
			return map[val]||val
		case ai.Reference:
			return '*' + (<AttributeReferenceType>type).reference
		case ai.Id:
			return "uint"
		case ai.Date:
			return "*time.Time"
		default:
			return type.name.toLowerCase()
	}
}



export function render (model:IModel, options:any={}): Promise<TemplateResult> {
	return co(function *() {
		let value:any = {
			name: model.name,
			initializers: [],
			comments: model.comments,
			package: model.package
		}
		let required = [];
    var objects = [];
		value.attributes = model.attributes.map(function (attr) {
			let req = !!~attr.modifiers.indexOf('required')

			let tname = goType(attr.type, options.map)

			let type = attr.repeated ? `[]${tname}` : tname

			type = ((req || attr.repeated) ? '' : '*') + type

			if (req) {
				required.push({
					name: attr.name,
					type: tname,
					comments: attr.comments
					json: attr.name
				})
			}

			if (attr.type.identifier === AttributeIdentifier.Object) {
				objects.push({
					name: model.name + attr.name.capitalize()
				})

			}

			return {
				name: attr.access === 'private' ? attr.name : attr.name.capitalize(),
				type: type,
				required: req,
				comments: attr.comments,
				json: attr.name,
				readonly: !~~attr.modifiers.indexOf('readonly')
			}
		});

		let rinit = required.map(function (m) {
			return `${m.name}: ${m.name},`
		})

		value.params = required.map(function (m) {
			return `${m.name} ${m.type}`
		});
		value.body = rinit.join('\n    ')


		let rendered = compile('template', value)
		//console.log(rendered.replace(/(:?(\r\n|\n|\r){2,})/mgi, ''))
		//console.log(rendered.match(/(:?(\r\n|\n|\r){2,})/g))
		//process.exit();
		return {
			extension: '.go',
			content: rendered.replace(/^(\s)*([\r\\n]{2,})*/gm, '$1')
		}
	});

}

/*export function *additionalFiles(): Promise<File[]> {
	return [{
		name: 'Reflectable.swift',
		content: yield fs.readFile(fw, 'utf8')
	}]
}*/