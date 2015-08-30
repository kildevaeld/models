/// <reference path="../../typings/tsd.d.ts" />

import {IModel} from '../models'
import * as hbs from 'handlebars'
export * from '../models'

const fs = require('mz/fs');

export var handlebars = hbs

export function compile(path:string, locals?:any): Promise<string> {
	return fs.readFile(path, 'utf8').then(function (data) {
		let template = hbs.compile(data);
		
		return template(locals||{});	
	});
}


export interface TemplateResult {
	extension: string
	content: string
}

export interface File {
	name: string
	content: string
}

export interface ITemplate {
	render (model:IModel): Promise<TemplateResult>
	additionalFiles?: () => Promise<File[]>
}