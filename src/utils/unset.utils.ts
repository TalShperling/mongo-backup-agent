export const transformUnsetFromArray = (fieldsToUnset: string[]) => {
  const obj: any = {}
  fieldsToUnset.forEach((fieldName) => {
    obj[fieldName] = '';
  })

  return obj;
}
