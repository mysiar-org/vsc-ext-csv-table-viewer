import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

import { DataEngine, createEngine } from "./engine";

export async function loadParquet(uri: vscode.Uri): Promise<string> {
    console.log("[DuckReader] Step 1: Reading file from VS Code FS");
    const data = await vscode.workspace.fs.readFile(uri);

    console.log("[DuckReader] Step 2: Writing temp Parquet file");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "duck-parquet-"));
    const tmpFile = path.join(tmpDir, "file.parquet");
    await fs.writeFile(tmpFile, Buffer.from(data));

    console.log("[DuckReader] Step 3: Initializing DuckDB engine (native or WASM)");
    const engine = await createEngine();

    const escapedPath = tmpFile.replace(/'/g, "''");

    console.log("[DuckReader] Step 4: Reading schema");
    const schemaRows = await engine.query<any>(
        `DESCRIBE SELECT * FROM read_parquet('${escapedPath}')`
    );

    const columns = schemaRows.map(r => r.column_name);
    let csv = columns.join(",") + "\n";

    console.log("[DuckReader] Step 5: Reading rows");
    const rows = await engine.query<any>(
        `SELECT * FROM read_parquet('${escapedPath}')`
    );

    console.log("[DuckReader] Step 6: Converting to CSV");
    for (const record of rows) {
        const row = columns.map(col => escapeCsv(record[col]));
        csv += row.join(",") + "\n";
    }

    console.log("[DuckReader] Step 7: Closing engine");
    try { await engine.close(); } catch { }

    console.log("[DuckReader] Done");
    engine.close()
    return csv;
}

function escapeCsv(value: any): string {
    if (value === null || value === undefined) return "";

    let str = String(value).trim();

    if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) {
        return str;
    }

    str = str.replace(/\r?\n|\r/g, " ");

    const needsQuotes = str.includes(",") || str.includes('"');

    if (needsQuotes) {
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    }

    return str;
}


// import * as vscode from "vscode";
// import duckdb from "duckdb";
// import * as fs from "fs/promises";
// import * as path from "path";
// import * as os from "os";

// export async function loadParquetDuck(uri: vscode.Uri): Promise<string> {
//     console.log("[DuckReader] Step 1: Reading file from VS Code FS");
//     const data = await vscode.workspace.fs.readFile(uri);

//     console.log("[DuckReader] Step 2: Writing temp Parquet file");
//     const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "duck-parquet-"));
//     const tmpFile = path.join(tmpDir, "file.parquet");
//     await fs.writeFile(tmpFile, Buffer.from(data));

//     console.log("[DuckReader] Step 3: Initializing DuckDB");
//     let conn: duckdb.Connection;
//     try {
//         const db = new duckdb.Database(":memory:");
//         conn = db.connect();
//     } catch (e) {
//         console.error("[DuckReader] DuckDB init failed:", e);
//         throw new Error("DuckDB failed to initialize");
//     }

//     console.log("[DuckReader] Step 4: Reading schema");

//     let schemaRows: any[];
//     try {
//         schemaRows = await new Promise<any[]>((resolve, reject) => {
//             conn.all(
//                 `DESCRIBE SELECT * FROM read_parquet('${tmpFile.replace(/'/g, "''")}')`,
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             );
//         });
//     } catch (e) {
//         console.error("[DuckReader] Schema query crashed:", e);
//         throw new Error("DuckDB failed to read schema");
//     }

//     const columns = schemaRows.map(r => r.column_name);
//     let csv = columns.join(",") + "\n";

//     console.log("[DuckReader] Step 5: Reading rows");

//     let rows: any[];
//     try {
//         rows = await new Promise<any[]>((resolve, reject) => {
//             conn.all(
//                 `SELECT * FROM read_parquet('${tmpFile.replace(/'/g, "''")}')`,
//                 (err, rows) => err ? reject(err) : resolve(rows)
//             );
//         });
//     } catch (e) {
//         console.error("[DuckReader] Data query crashed:", e);
//         throw new Error("DuckDB failed to read rows");
//     }

//     console.log("[DuckReader] Step 6: Converting to CSV");

//     for (const record of rows) {
//         const row = columns.map(col => escapeCsv(record[col]));
//         csv += row.join(",") + "\n";
//     }

//     console.log("[DuckReader] Step 7: Closing connection");
//     try { conn.close(); } catch { }

//     console.log("[DuckReader] Done");
//     return csv;
// }


// function escapeCsv(value: any): string {
//     if (value === null || value === undefined) return "";

//     let str = String(value).trim();

//     // If already properly quoted, leave it untouched
//     if (
//         str.length >= 2 &&
//         str.startsWith('"') &&
//         str.endsWith('"')
//     ) {
//         return str;
//     }

//     // Normalize embedded newlines (they break CSV rows)
//     str = str.replace(/\r?\n|\r/g, " ");

//     const needsQuotes =
//         str.includes(",") ||
//         str.includes('"');

//     if (needsQuotes) {
//         str = str.replace(/"/g, '""');
//         return `"${str}"`;
//     }

//     return str;
// }
