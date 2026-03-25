import { initNativeDuckDb as NativeDuckDb } from "./duckdbNative";

export interface DataEngine {
    kind: "duckdb-native" | "duckdb-wasm" | "parquet-wasm";

    supportsSql: boolean;

    init?(): Promise<void>;
    query<T = any>(sql: string): Promise<T[]>;
    close(): Promise<void>;
}


export async function createEngine(fileBuffer: Uint8Array): Promise<DataEngine> {
    console.log("[Engine] Initializing engine…");

    // Try native DuckDB
    try {
        console.log("[Engine] Trying native DuckDB engine…");
        const native = await NativeDuckDb();
        console.log("[Engine] ✔ Using NATIVE DuckDB engine");
        return native;
    } catch (err) {
        console.warn("[Engine] Native DuckDB failed:", err);
        throw err;
    }
}

