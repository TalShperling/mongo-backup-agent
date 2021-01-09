
/**
 * The unset property expects to get a list of fields to remove and quotation marks, for example:
 * {"fieldToUnset": ""}.
 * The fields to unset that being received from the mongodb change stream are received as a list.
 * This function meant to convert this list into the required object for the mongodb unset function.
 * @param fieldsToUnset - list of fields names to unset.
 */
export const transformUnsetFromArray = (fieldsToUnset: string[]) => {
  const obj: any = {}
  fieldsToUnset.forEach((fieldName) => {
    obj[fieldName] = '';
  })

  return obj;
}
