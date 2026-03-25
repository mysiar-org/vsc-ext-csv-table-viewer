import duckdb from "duckdb";
import type { DataEngine } from "./engine";

export async function initNativeDuckDb(): Promise<DataEngine> {
    const db = new duckdb.Database(":memory:");
    const conn = db.connect();

    return {
        kind: "duckdb-native",
        supportsSql: true,

        async query<T = any>(sql: string): Promise<T[]> {
            return new Promise((resolve, reject) => {
                conn.all(sql, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows as T[]);
                });
            });
        },

        async close() {
            try { conn.close(); } catch { }
        }
    };
}
