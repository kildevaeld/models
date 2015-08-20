/// <reference path="../../../typings/parser.d.ts"/>
/// <reference path="../../../typings/tsd.d.ts" />

import {IModel,IAttribute, AttributeIdentifier, IAttributeType, AttributeCustomType, AttributeReferenceType} from '../../models'
import {TemplateFunc, TemplateResult,compile, handlebars, File} from '../template'
const nodePath = require('path');
const co = require('co');
const fs = require('mz/fs')

let fw = nodePath.resolve(__dirname,'reflectable.hbs')

export function swiftType (type: IAttributeType): string {
	let ai = AttributeIdentifier
	switch (type.identifier) {
		case ai.Custom:
			return (<AttributeCustomType>type).value
		case ai.Reference:
			return (<AttributeReferenceType>type).reference
		case ai.Id:
			return "Int"
		default:
			return type.name
	}
}

export function render (model:IModel, options:any = {}): Promise<TemplateResult> {
	return co(function *() {
		let value:any = {
			name: model.name,
			initializers: [],
			options: options,
			comments: model.comments
		}
		let required = [];

		value.attributes = model.attributes.map(function (attr) {
			let req = !!~attr.modifiers.indexOf('required')
			let readonly = !!~attr.modifiers.indexOf('readonly')
			let tname = swiftType(attr.type)
			let type = attr.repeated ? `[${tname}]` : tname
			type += ((req || attr.repeated) ? '' : '?')

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
				readonly: readonly,
				comments: attr.comments
			}
		});

		let rinit = required.map(function (m) {
			return `${m.name}: ${m.type}`
		})

		value.initializers.push({
			params: rinit.join(', '),
			body: required.map(function (m) {
				return `self.${m.name} = ${m.name}`
			}).join('\n    ')
		})
		value.initializers.push({
			params: value.attributes.map(function (m) {
				return `${m.name}: ${m.type}`
			}).join(', '),
			body: value.attributes.map(function (m) {
				return `self.${m.name} = ${m.name}`
			}).join('\n    ')
		});

		return {
			extension: '.swift',
			content:  yield compile(nodePath.join(__dirname,'template.hbs'), value)
		}
	});

}

export function *additionalFiles(): Promise<File[]> {
	return [{
		name: 'Reflectable.swift',
		content: yield fs.readFile(fw, 'utf8')
	}]
}