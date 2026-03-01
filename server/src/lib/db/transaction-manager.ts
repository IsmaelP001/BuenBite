import { SQLiteTransaction } from "drizzle-orm/sqlite-core";

export interface ClientTransaction {
    execute(tx: SQLiteTransaction<any, any, any, any>): Promise<void>
}