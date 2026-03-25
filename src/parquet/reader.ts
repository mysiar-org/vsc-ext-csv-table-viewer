import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

import { DataEngine, createEngine } from "./engine";

export async function loadParquetDuck(uri: vscode.Uri): Promise<string> {
    console.log("[ParquetReader] Step 1: Reading file from VS Code FS");
    const data = await vscode.workspace.fs.readFile(uri);

    console.log("[ParquetReader] Step 2: Writing temp Parquet file");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "vsc-ext-csv-table-viewer-parquet-"));
    const tmpFile = path.join(tmpDir, "file.parquet");
    await fs.writeFile(tmpFile, Buffer.from(data));

    // console.log("[DuParquetReaderckReader] Step 3: Initializing DuckDB engine (native or WASM)");
    // const engine = await createEngine(data);
    console.log("[ParquetReader] Step 3: Initializing DuckDB engine (native or WASM)");

    let engine: DataEngine;
    try {
        engine = await createEngine(data);
    } catch (err: any) {
        vscode.window.showErrorMessage(
            "Failed to initialize DuckDB engine.\n" +
            (err?.message ?? String(err)),
            { modal: true }
        );
        throw err; // rethrow so caller knows it failed
    }


    const escapedPath = tmpFile.replace(/'/g, "''");

    console.log("[ParquetReader] Step 4: Reading schema");
    const schemaRows = await engine.query<any>(
        `DESCRIBE SELECT * FROM read_parquet('${escapedPath}')`
    );

    const columns = schemaRows.map(r => r.column_name);
    let csv = columns.join(",") + "\n";

    console.log("[ParquetReader] Step 5: Reading rows");
    const rows = await engine.query<any>(
        `SELECT * FROM read_parquet('${escapedPath}')`
    );

    console.log("[ParquetReader] Step 6: Converting to CSV");
    for (const record of rows) {
        const row = columns.map(col => escapeCsv(record[col]));
        csv += row.join(",") + "\n";
    }

    console.log("[ParquetReader] Step 7: Closing engine");
    try { await engine.close(); } catch { }

    console.log("[ParquetReader] Done");
    engine.close();
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

