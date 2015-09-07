
import {IModel,IAttribute, AttributeIdentifier, IAttributeType, AttributeCustomType, AttributeReferenceType} from '../../models'
import {TemplateFunc, TemplateResult, handlebars, File} from '../template'

const nodePath = require('path');
const co = require('co');
const fs = require('mz/fs')

import {template} from 'micro-template'

template.get = function (id) {

  return require('fs').readFileSync(nodePath.resolve(__dirname,'./' + id + '.tmpl'), 'utf-8')

};


export function compile(path:string, locals?:any): Promise<string> {
  return template('template', locals);
}


export function tsType (type: IAttributeType): string {
  let ai = AttributeIdentifier

  switch (type.identifier) {
    case ai.Custom:
      return (<AttributeCustomType>type).value
    case ai.Reference:
      return (<AttributeReferenceType>type).reference
    case ai.UInt64: case ai.UInt32: case ai.UInt16: case ai.UInt8: case ai.Int64: case ai.Int32:
    case ai.Int16: case ai.Int8: case ai.Float: case ai.Double:
      return 'Number'
    case ai.Id:
      return 'Schema.Types.ObjectId'
    default:
      return AttributeIdentifier[type.identifier]
  }
}

function mapAttributes(attrs, references): any {

  return attrs.map( m => {
    if (m.type instanceof AttributeReferenceType) {
        m.reference = m.type.reference
        references.push(m.type.reference)
      }
      if (m.type.definition)
        m.attributes = mapAttributes(m.type.definition, references)

      m.type = tsType(m.type);

      m.access = m.access||'public'
      m.readonly = !!~m.modifiers.indexOf('readonly');
      m.required = !!~m.modifiers.indexOf('required')
      m.index = !!~m.modifiers.indexOf('index');
      // if (m.required) {
      //   required.push(`${m.name}:${m.type}`)
      // }

      if (m.validations) {
          m.validations = m.validations.map(v => {

              if (v.name == 'regexp') {
                  v.args = `/${v.args[0]}/${v.args[1]}`
                  v.name = "isRegExp"
              } else if (v.args) {
                  v.args = "[" + v.args.map( a => {
                    return /[0-9]+/.test(a) ? a : '"' + a + '"'
                  }).join(', ') + "]"
              } else {
                v.name = "is" + v.name == 'url' ? 'URL' : v.name.capitalize()
              }


              return v
          }).filter( x => x !== null)
         if (!m.validations.length) m.validations = void 0
      }
      return m
    });

}



export function render (model:IModel): Promise<TemplateResult> {

  return co(function *() {

    var value = model
    var required = []

    var references = []
    //console.log(require('util').inspect(value,{depth:10,colors:true}))
    value.attributes = mapAttributes(value.attributes, references);

    value.references = references

    let rendered = template('template', value)
    //value.init = required //.join(', ');
    return {
      extension: '.js',
      content: rendered
  }

  });
}

