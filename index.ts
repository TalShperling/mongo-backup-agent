import { initiateMongoClient } from "./src/mongo-client";
import config from "config";ְ
import { DBConfig } from "./src/models/db/db-config";

(async () => {
    const activeClient = initiateMongoClient(config.get<DBConfig>("activeDBConfig").connectionString);
    const backupClient = initiateMongoClient(config.get<DBConfig>("backupDBConfig").connectionString);

    startActiveBackup(activeClient, backupClient);
})();