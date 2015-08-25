

export enum AttributeIdentifier {
  // numbers
  UInt64, UInt32, UInt16, UInt8,Int64, Int32, Int16, Int8, Float, Double, 
  String, Id, Boolean, Reference, Custom
}

export interface IAttributeType {
  identifier:AttributeIdentifier
  name: string
}


export class AttributeBuiltinType implements IAttributeType {
  identifier: AttributeIdentifier
  get name (): string {
    return AttributeIdentifier[this.identifier]
  }
  constructor(type:AttributeIdentifier) {
    this.identifier = type
  } 
  toJSON (): any {
    let names = Object.getOwnPropertyNames(this);
    let out: any = {};
    names.forEach((name) => {
      out[name] = this[name]
    });
    out.name = this.name;
    return out
  }
}


export interface AttributeReferenceTypeOptions {
  reference: string
  reverse?: string
}

export class AttributeReferenceType extends AttributeBuiltinType {
  reference: string
  reverse: string
  constructor(type:AttributeIdentifier, options:AttributeReferenceTypeOptions) {
    super(type)
    this.reference = options.reference
  } 
}

export interface AttributeCustomTypeOptions {
  value: string
}

export class AttributeCustomType extends AttributeBuiltinType {
  value: string
  constructor(type:AttributeIdentifier, options:AttributeCustomTypeOptions) {
    super(type)
    this.value = options.value
  } 
}

export enum Modifier {
  Required, Index
}

export interface IModel {
  name: string
  attributes: Array<IAttribute>
}

export interface IAttribute {
  name: string
  type: IAttributeType
  modifiers: Modifier[]
  validations: Array<IValidation>
  repeated: boolean
}

export interface IValidation {
  name: string
  args: Array<any>
}
