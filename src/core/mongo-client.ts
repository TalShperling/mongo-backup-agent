import { MongoClient } from 'mongodb';
import { MongoClientRole } from '../models/mongo-client-role';
import { logDisruptionsOnEventEmitter } from '../utils/logger/common-logs/event-emitter';
import { logInfo } from '../utils/logger/logger';

export const initiateMongoClient = async (mongoConnectionString: string, mongoClientRole: MongoClientRole) => {
  logInfo(`Starting ${mongoClientRole} mongo client`);
  const mongoClient = await MongoClient.connect(mongoConnectionString, { useUnifiedTopology: true });
  logDisruptionsOnEventEmitter(mongoClient, mongoClientRole);

  return mongoClient;
}
