/// <reference path="../typings/parser.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />

import * as nodePath from 'path'
import {IAttributeType, AttributeBuiltinType, AttributeCustomType,AttributeReferenceType, IModel, AttributeIdentifier} from './models'
import tokenizer from './tokenizer'
const fs = require('mz/fs'),
  co = require('co');


function capitalize (str:string): string {
  return str.charAt(0).toUpperCase() + str.substr(1)
}

interface TypeMap {
  name: string
  type: string
}

function stringToType (type:TypeMap): IAttributeType {
  let attr: IAttributeType
  let id: AttributeIdentifier = AttributeIdentifier[capitalize(type.name)]
  if (type.type === 'builtin') {
    attr = new AttributeBuiltinType(id)
  } else if (type.type === 'custom') {
    attr = new AttributeCustomType(AttributeIdentifier.Custom, {value:type.name})
  } else if (type.type === 'reference') {
    attr = new AttributeReferenceType(AttributeIdentifier.Reference, {reference:type.name})
  }

  return attr
}


interface Template {
  name: string
}


function JSONToIModel (model: any): IModel {
  for (let attr of model.attributes) {
    let type = stringToType(attr.type)
    attr.type = type;
  }
  return model
}

export function parseString (str:string): IModel[] {
  let models = (<any>tokenizer).parse(str, {
    output: 'source'
  });

  if (models === null) return;

  for (let model of models) {
    JSONToIModel(model)
  }

  return models
}


export function parseFile (path: string): Promise<Array<models.IModel>> {
  let extname = nodePath.extname(path);

  return co(function * () {
    let models;
    let data = yield fs.readFile(path, 'utf8')

    switch (extname) {
      case '.model':
        models = (<any>tokenizer).parse(data, {
          output: 'source'
        });
        break
      case '.cson', '.json':
      default:
        models = null
    }

    if (models === null) return;

    for (let model of models) {
      JSONToIModel(model)
    }

    return models
  });

}
