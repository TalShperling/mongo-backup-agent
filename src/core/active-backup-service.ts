import { ChangeEvent, ChangeEventCR, ChangeEventDelete, ChangeEventOther, ChangeEventUpdate, ChangeStream, Db } from "mongodb";
import { OPERATION_TYPE } from "../models/db/operation-type.enum";
import { transformUnsetFromArray } from "../utils/unset.utils";

const initializeChangeMap = () => {
    let changeMap: Map<OPERATION_TYPE, (db: Db, event: any) => {}> = new Map();

    changeMap.set(OPERATION_TYPE.REPLACE, (db: Db, event: ChangeEventCR) => {
        return db.collection(event.ns.coll).findOneAndReplace({ "_id": event.fullDocument._id }, event.fullDocument);
    });
    changeMap.set(OPERATION_TYPE.INSERT, (db: Db, event: ChangeEventCR) => {
        return db.collection(event.ns.coll).insertOne(event.fullDocument);
    });
    changeMap.set(OPERATION_TYPE.UPDATE, (db: Db, event: ChangeEventUpdate) => {
        let fieldsToUnset = event.updateDescription.removedFields;
        let fieldsToSet = event.updateDescription.updatedFields;
        if (fieldsToUnset.length && Object.keys(fieldsToSet).length) {
            return db.collection(event.ns.coll).updateOne({ "_id": event.documentKey._id },
                { $set: event.updateDescription.updatedFields, $unset: transformUnsetFromArray(event.updateDescription.removedFields as string[]) });
        } else if (!fieldsToUnset.length && Object.keys(fieldsToSet).length){
            return db.collection(event.ns.coll).updateOne({ "_id": event.documentKey._id },
                { $set: event.updateDescription.updatedFields });
        } else {
            return db.collection(event.ns.coll).updateOne({ "_id": event.documentKey._id },
            { $unset: transformUnsetFromArray(event.updateDescription.removedFields as string[]) });
        }
    });
    changeMap.set(OPERATION_TYPE.DELETE, (db: Db, event: ChangeEventDelete) => {
        return db.collection(event.ns.coll).deleteOne({ "_id": event.documentKey._id });
    });
    changeMap.set(OPERATION_TYPE.DROP, (db: Db, event: ChangeEventOther) => {
        return db.dropCollection(event.ns.coll);
    });
    changeMap.set(OPERATION_TYPE.DROP_DATABASE, (db: Db, event: ChangeEventOther) => {
        return db.dropDatabase();
    });

    return changeMap;
}

export const startActiveBackupSync = (activeDB: Db, backupDB: Db) => {
    const activeChangeStream: ChangeStream = activeDB.watch();
    let changeMap: Map<OPERATION_TYPE, (db: Db, event: any) => {}> = initializeChangeMap();

    activeChangeStream.on("change", async (changeEvent: ChangeEvent) => {
        let func: ((db: Db, event: any) => {}) | undefined = changeMap.get(changeEvent.operationType as OPERATION_TYPE)
        func && func(backupDB, changeEvent);
    });
}