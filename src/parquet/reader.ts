
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ParquetReader } = require("parquetjs-lite");

import * as vscode from "vscode";

export async function loadParquet(uri: vscode.Uri): Promise<string> {
    // 1. Read Parquet file
    const data = await vscode.workspace.fs.readFile(uri);
    const reader = await ParquetReader.openBuffer(Buffer.from(data));
    const cursor = reader.getCursor();
    const schema = reader.schema.fields;

    // 2. Build CSV header
    const columns = Object.keys(schema);
    let csv = columns.join(",") + "\n";

    // 3. Stream rows → CSV
    let record: any;
    while ((record = await cursor.next())) {
        const row = columns.map(col => {
            const val = record[col];

            if (val === null || val === undefined) return "";

            // Escape strings
            if (typeof val === "string") {
                return `"${val.replace(/"/g, '""')}"`;
            }

            return val;
        });

        csv += row.join(",") + "\n";
    }

    await reader.close();
    return csv;
}




// // eslint-disable-next-line @typescript-eslint/no-var-requires

// const { ParquetReader } = require("parquetjs-lite");

// import * as vscode from "vscode";

// export async function loadParquet(uri: vscode.Uri): Promise<any[]> {
//     const data = await vscode.workspace.fs.readFile(uri);
//     const reader = await ParquetReader.openBuffer(Buffer.from(data));
//     // const reader = await ParquetReader.openFile(uri.fsPath);
//     const cursor = reader.getCursor();
//     const rows: any[] = [];

//     let record;
//     while ((record = await cursor.next())) {
//         rows.push(record);
//     }

//     await reader.close();
//     return rows;
// }
