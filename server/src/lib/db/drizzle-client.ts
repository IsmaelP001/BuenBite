// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  BuildQueryResult,
  DBQueryConfig,
  eq,
  ExtractTablesWithRelations,
  InferInsertModel,
} from "drizzle-orm";
import { db } from "../../config/drizzle/db";
import * as schema from "../../config/drizzle/schemas";
import { ClientTransaction } from "./transaction-manager";

type TSchema = ExtractTablesWithRelations<typeof schema>;

type QueryConfig<TableName extends keyof TSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  TSchema,
  TSchema[TableName]
>;

type OptsQuery<T extends keyof TSchema> = QueryConfig<T>;

type QueryResult<
  TableName extends keyof TSchema,
  QBConfig extends QueryConfig<TableName>
> = BuildQueryResult<TSchema, TSchema[TableName], QBConfig>;

export async function dbGetAll<
  T extends keyof TSchema,
  Opts extends OptsQuery<T>
>(table: T, opts?: Opts): Promise<QueryResult<T, Opts>[]> {
  try {
    const data = await db.query[table].findMany(opts || {});
    return data as QueryResult<T, Opts>[];
  } catch (error) {
    console.log("err", error);
    throw new Error("Error getting data: " + error);
  }
}

export async function dbGetOne<
  T extends keyof TSchema,
  Opts extends OptsQuery<T>
>(table: T, opts?: Opts): Promise<QueryResult<T, Opts>> {
  try {
    const data = await db.query[table].findFirst(opts || {});

    return data as QueryResult<T, Opts>;
  } catch (error) {
    throw new Error("Error getting data: " + error);
  }
}

export async function dbGetById<T extends keyof TSchema>(
  table: T,
  id: number,
  Opts?: OptsQuery<T>
) {
  try {
    const data = await db.query[table].findFirst({
      where: eq(schema[table].id, id),
      columns: Opts?.columns,
      with: Opts?.with,
      extras: Opts?.extras,
    });

    if (!data) {
      throw new Error("No record found");
    }

    return data;
  } catch (error) {
    throw new Error("Error getting data: " + error);
  }
}

export async function dbPost<T extends keyof TSchema>(
  table: T,
  values: InferInsertModel<(typeof schema)[T]>
) {
  try {
    const [data] = await db
      .insert(schema[table])
      .values(values as any)
      .returning();

    if (!data) {
      throw new Error("Error creating element");
    }

    return data;
  } catch (error) {
    throw new Error("Error getting data: " + error);
  }
}

export async function dbPut<T extends keyof TSchema>(  table:T,{
  where,
  values,
}: {
  where: {
    [K in keyof InferInsertModel<(typeof schema)[T]>]?: InferInsertModel<
      (typeof schema)[T]
    >[K];
  };
  values: Partial<InferInsertModel<(typeof schema)[T]>>;
}) {
  try {
    const [keyId, value] = Object.entries(where) as any;
    const [data] = await db
      .update(schema[table])
      .set(values as Record<string, any>)
      .where(eq(schema[table][keyId], value))
      .returning();

    if (!data) {
      throw new Error("Error updating element");
    }

    return data;
  } catch (error) {
    throw new Error("Error getting data: " + error);
  }
}


export async function dbDelete<T extends keyof typeof schema>(
  table: T,
  { where }: { where: Partial<InferInsertModel<(typeof schema)[T]>> }
) {
  try {
    const tableSchema = schema[table];
    const conditions = Object.entries(where).map(([key, value]) =>
      eq(tableSchema[key as keyof typeof tableSchema], value)
    );

    if (!conditions.length) {
      throw new Error("Where params not defined");
    }

    const [data] = await db
      .delete(tableSchema)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .returning();

    if (!data) {
      throw new Error("Error deleting element");
    }

    return data;
  } catch (error) {
    throw new Error("Error deleting data: " + error);
  }
}


export async function executeTransaction(
  transaction: ClientTransaction
): Promise<void> {
  await db.transaction(async (tx) => await transaction.execute(tx));
}

export async function initiateTransaction(transactionContext) {
  await db.transaction(async (tx) => {
    await transactionContext.start(tx);
    await transactionContext.end(tx);
  });
}
