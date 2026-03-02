// Función jsonAgg corregida para PostgreSQL
import type { SQL, InferColumnsDataTypes } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { sql, DrizzleError } from "drizzle-orm";

export function jsonAgg<T extends Record<string, PgColumn>>(select: T) {
    const chunks: SQL[] = [];
    const entries = Object.entries(select);

    if (!entries.length) {
        throw new DrizzleError({ message: 'Cannot aggregate an empty object' });
    }

    entries.forEach(([key, column], index) => {
        if (index > 0) chunks.push(sql`,`);
        chunks.push(sql.raw(`'${key}',`), sql`${column}`);
    });

    // Simplificamos el FILTER - solo agregamos si hay valores no nulos
    return sql<InferColumnsDataTypes<T>[]>`
      COALESCE(
        json_agg(
          json_build_object(${sql.join(chunks)})
        ) FILTER (WHERE ${entries[0][1]} IS NOT NULL), 
        '[]'::json
      )
    `;
}
