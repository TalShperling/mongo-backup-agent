/* eslint-disable no-unused-vars */
/**
 * Mongodb change-stream operation types.
 */
export enum OPERATION_TYPE {
    REPLACE = 'replace',
    INSERT = 'insert',
    DELETE = 'delete',
    UPDATE = 'update',
    RENAME = 'rename',
    DROP = 'drop',
    DROP_DATABASE = 'dropDatabase',
    INVALIDATE = 'invalidate'
}
