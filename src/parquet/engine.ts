import { initNativeDuckDb } from "./duckdbNative";

export interface DataEngine {
    kind: "duckdb-native" | "duckdb-wasm" | "parquet-wasm";

    // Does this engine support SQL?
    supportsSql: boolean;

    // Optional initialization step
    init?(): Promise<void>;

    // SQL-like query interface
    query<T = any>(sql: string): Promise<T[]>;

    // Cleanup
    close(): Promise<void>;
}

/**
 * IMPORTANT:
 * No more singleton. Each file gets its own engine instance.
 */
export async function createEngine(): Promise<DataEngine> {
    console.log("[Engine] Initializing engine…");

    try {
        console.log("[Engine] Trying native DuckDB engine…");
        const native = await initNativeDuckDb();
        console.log("[Engine] ✔ Using NATIVE DuckDB engine");
        return native;
    } catch (err) {
        console.error("[Engine] Native DuckDB failed:", err);
        throw err; // no fallback yet
    }
}
