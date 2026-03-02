import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";

import { SQL, sql, type AnyColumn } from "drizzle-orm";


import * as schema from "../../config/drizzle/schemas";

type TSchema = ExtractTablesWithRelations<typeof schema>;
type QueryConfig<TableName extends keyof TSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  TSchema,
  TSchema[TableName]
>;

export type InferQueryModel<
  TableName extends keyof TSchema,
  QBConfig extends QueryConfig<TableName>
> = BuildQueryResult<TSchema, TSchema[TableName], QBConfig>;


import { Table, } from "drizzle-orm";


export function jsonAgg<T extends Record<string, AnyColumn> | Table>(select: T) {
  const chunks: SQL[] = [];
  let notNullColumn;

  Object.entries(select).forEach(([key, column], index) => {
    if (index > 0) {
      chunks.push(sql`,`);
    } else {
      notNullColumn = column;
    }

    chunks.push(sql.raw(`'${key}',`), sql`${column}`);
  });

  if (!notNullColumn) throw new Error("No columns in select for jsonAgg");

  return sql<string>`COALESCE(JSON_GROUP_ARRAY(JSON_OBJECT(${sql.join(chunks)}))
                              FILTER (WHERE ${notNullColumn} IS NOT NULL),'[]')`
    .mapWith(JSON.parse);
}


