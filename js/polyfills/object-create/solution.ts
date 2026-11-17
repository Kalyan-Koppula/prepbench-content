function objectCreate(proto: object | null, propertiesObject?: PropertyDescriptorMap): any {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null: ' + String(proto))
  }
  const obj = Object.setPrototypeOf({}, proto)
  if (propertiesObject !== undefined) Object.defineProperties(obj, propertiesObject)
  return obj
}
