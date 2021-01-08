import config from "config";
import { startActiveBackupSync } from "./src/core/active-backup-service";
import { initiateMongoClient } from "./src/core/mongo-client";
import { DBConfig } from "./src/models/db/db-config";

(async () => {
    try {
        console.log("Starting mongo-backup server");
        const activeClient = await initiateMongoClient(config.get<DBConfig>("activeDBConfig").connectionString);
        console.log("Active mongo-client initialized");
        const backupClient = await initiateMongoClient(config.get<DBConfig>("backupDBConfig").connectionString);
        console.log("Backup mongo-client initialized");

        config.get<DBConfig>("activeDBConfig").dbList.forEach(db => {
            startActiveBackupSync(activeClient.db(db), backupClient.db(db)); 
        });

    } catch (err) {
        console.error(err);
    }
})();