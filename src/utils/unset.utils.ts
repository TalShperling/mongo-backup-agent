export const transformUnsetFromArray = (fieldsToUnset: string[]) => {
    let obj: any = {};
    fieldsToUnset.forEach((fieldName) => {
        obj[fieldName] = "";
    });

    return obj;
}