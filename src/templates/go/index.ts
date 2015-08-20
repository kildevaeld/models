/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />

import {IModel,IAttribute, AttributeIdentifier, IAttributeType, AttributeCustomType, AttributeReferenceType} from '../../models'
import {TemplateFunc, TemplateResult,compile, handlebars, File} from '../template'
const nodePath = require('path');
const co = require('co');
const fs = require('mz/fs')

//let fw = nodePath.resolve(__dirname,'reflectable.hbs')

export function goType (type: IAttributeType): string {
	let ai = AttributeIdentifier
	switch (type.identifier) {
		case ai.Custom:
			return (<AttributeCustomType>type).value
		case ai.Reference:
			return '*' + (<AttributeReferenceType>type).reference
		case ai.Id:
			return "int"
		default:
			return type.name.toLowerCase()
	}
}

export function render (model:IModel): Promise<TemplateResult> {
	return co(function *() {
		let value:any = {
			name: model.name,
			initializers: [],
			comments: model.comments,
			package: model.package
		}
		let required = [];
		
		value.attributes = model.attributes.map(function (attr) {
			let req = !!~attr.modifiers.indexOf('required')
			let tname = goType(attr.type)
			let type = attr.repeated ? `[]${tname}` : tname
			type = ((req || attr.repeated) ? '' : '*') + type
			
			if (req) {
				required.push({
					name: attr.name,
					type: tname
				})
			} 
			
			return {
				name: attr.name,
				type: type,
				required: req,
				comments: attr.comments
			}
		});
		
		let rinit = required.map(function (m) {
			return `${m.name}: ${m.name},`
		})
		
		value.params = required.map(function (m) {
			return `${m.name}: ${m.type}`
		});
		value.body = rinit.join('\n    ')
		
		return {
			extension: '.go',
			content:  yield compile(nodePath.join(__dirname,'template.hbs'), value)
		}
	});
 
}

/*export function *additionalFiles(): Promise<File[]> {
	return [{
		name: 'Reflectable.swift',
		content: yield fs.readFile(fw, 'utf8')
	}]
}*/