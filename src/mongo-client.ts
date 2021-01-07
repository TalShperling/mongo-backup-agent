import { MongoClient } from "mongodb";

export const initiateMongoClient = async (mongoConnectionString: string) => {
    return MongoClient.connect(mongoConnectionString);
}