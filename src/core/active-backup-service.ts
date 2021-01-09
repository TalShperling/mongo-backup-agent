import { ChangeEvent, ChangeEventCR, ChangeEventDelete, ChangeEventOther, ChangeEventUpdate, ChangeStream, Db, MongoError } from 'mongodb';
import { Maybe } from '../models/maybe';
import { OPERATION_TYPE } from '../models/operation-type.enum';
import { logDisruptionsOnEventEmitter } from '../utils/logger/common-logs/event-emitter';
import { logDebug, logInfo } from '../utils/logger/logger';
import { transformUnsetFromArray } from '../utils/unset.utils';

const initializeChangeMap = (): Map<OPERATION_TYPE, (db: Db, event: any) => {}> => {
  // TODO: Fix any type on event
  const changeMap: Map<OPERATION_TYPE, (db: Db, event: any) => {}> = new Map();

  changeMap.set(OPERATION_TYPE.REPLACE, (db: Db, event: ChangeEventCR) => {
    return db.collection(event.ns.coll).findOneAndReplace({ _id: event.fullDocument._id }, event.fullDocument);
  });
  changeMap.set(OPERATION_TYPE.INSERT, (db: Db, event: ChangeEventCR) => {
    return db.collection(event.ns.coll).insertOne(event.fullDocument);
  });
  changeMap.set(OPERATION_TYPE.UPDATE, (db: Db, event: ChangeEventUpdate) => {
    const fieldsToUnset = event.updateDescription.removedFields;
    const fieldsToSet = event.updateDescription.updatedFields;
    if (fieldsToUnset.length && Object.keys(fieldsToSet).length) {
      return db.collection(event.ns.coll).updateOne({ _id: event.documentKey._id },
        { $set: event.updateDescription.updatedFields, $unset: transformUnsetFromArray(event.updateDescription.removedFields as string[]) });
    } else if (!fieldsToUnset.length && Object.keys(fieldsToSet).length) {
      return db.collection(event.ns.coll).updateOne({ _id: event.documentKey._id },
        { $set: event.updateDescription.updatedFields });
    } else {
      return db.collection(event.ns.coll).updateOne({ _id: event.documentKey._id },
        { $unset: transformUnsetFromArray(event.updateDescription.removedFields as string[]) });
    }
  });
  changeMap.set(OPERATION_TYPE.DELETE, (db: Db, event: ChangeEventDelete) => {
    return db.collection(event.ns.coll).deleteOne({ _id: event.documentKey._id });
  });
  changeMap.set(OPERATION_TYPE.DROP, (db: Db, event: ChangeEventOther) => {
    const collectionName = event.ns.coll;
    logInfo(`Collection: ${collectionName} was dropped`);
    return db.dropCollection(collectionName);
  });
  changeMap.set(OPERATION_TYPE.DROP_DATABASE, (db: Db, event: ChangeEventOther) => {
    logInfo(`DB: ${db.databaseName} was dropped`);
    return db.dropDatabase();
  });

  return changeMap;
}

export const startActiveBackupSync = (activeDB: Db, backupDB: Db): void => {
  logInfo(`Starting synchronization for ${activeDB.databaseName} db`);
  const activeChangeStream: ChangeStream = activeDB.watch();
  const changeMap: Map<OPERATION_TYPE, (db: Db, event: any) => {}> = initializeChangeMap();

  activeChangeStream.on('change', async (changeEvent: ChangeEvent) => {
    logDebug(`change event was fired ${changeEvent}`);
    const func: Maybe<((db: Db, event: any) => {})> = changeMap.get(changeEvent.operationType as OPERATION_TYPE)
    func && func(backupDB, changeEvent);
  });

  logDisruptionsOnEventEmitter(activeChangeStream, 'Change stream');
}
