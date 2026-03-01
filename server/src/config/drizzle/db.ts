// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import Database from 'better-sqlite3';
import * as schema from './schemas';

// const sqlite = new Database('sqlite-dev.db');
// export const db = drizzle({ client: sqlite,schema });

import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = "postgresql://postgres.zhasoyfuddbwzpkghxyd:Ismael1996@aws-0-us-east-2.pooler.supabase.com:6543/postgres"

export const client = postgres(connectionString!, { prepare: false })
export const db = drizzle({client,schema});



