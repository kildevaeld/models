
import {IModel,IAttribute, AttributeIdentifier, IAttributeType, AttributeCustomType, AttributeReferenceType} from '../../models'
import {TemplateFunc, TemplateResult,compile, handlebars, File} from '../template'

const nodePath = require('path');
const co = require('co');
const fs = require('mz/fs')


export function tsType (type: IAttributeType): string {
	let ai = AttributeIdentifier
	
	switch (type.identifier) {
		case ai.Custom:
			return (<AttributeCustomType>type).value
		case ai.Reference:
			return (<AttributeReferenceType>type).reference
		case ai.UInt64: case ai.UInt32: case ai.UInt16: case ai.UInt8: case ai.Int64: case ai.Int32:  
		case ai.Int16: case ai.Int8: case ai.Float: case ai.Double: case ai.Id:
			return 'number'  
		default:
			return AttributeIdentifier[type.identifier].toLowerCase()
	}
}


export function render (model:IModel): Promise<TemplateResult> {
	
	return co(function *() {
		
		var value = model
		var required = []
		value.attributes = value.attributes.map(function (m) {
			m.type = tsType(m.type);
			m.access = m.access||'public'
			m.readonly = !!~m.modifiers.indexOf('readolny');
			m.required = !!~m.modifiers.indexOf('required')
			if (m.required) {
				required.push(`${m.name}:${m.type}`)
			}
 			return m
		});
		
		value.init = required //.join(', ');
		
		return {
			extension: '.ts',
			content:  yield compile(nodePath.join(__dirname,'template.hbs'), value)
	}
		
	})
	
	
	
}

