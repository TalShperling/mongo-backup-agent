import { MongoClient } from 'mongodb';
import { MongoClientRole } from '../models/mongo-client-role';
import { logDisruptionsOnEventEmitter } from '../utils/logger/common-logs/event-emitter';
import { logInfo } from '../utils/logger/logger';

/**
 * Initiates a mongo client based on a connection string and connection role.
 * @param mongoConnectionString - connection string to the wanted db.
 * @param mongoClientRole - Active/Backup mongo client.
 */
export const initiateMongoClient = async (mongoConnectionString: string, mongoClientRole: MongoClientRole) => {
  logInfo(`Starting ${mongoClientRole} mongo client`);
  const mongoClient = await MongoClient.connect(mongoConnectionString, { useUnifiedTopology: true });
  logDisruptionsOnEventEmitter(mongoClient, mongoClientRole);

  return mongoClient;
}
