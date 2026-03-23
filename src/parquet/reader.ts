// eslint-disable-next-line @typescript-eslint/no-var-requires

const { ParquetReader } = require("parquetjs-lite");

import * as vscode from "vscode";

export async function loadParquet(uri: vscode.Uri): Promise<any[]> {
    const reader = await ParquetReader.openFile(uri.fsPath);
    const cursor = reader.getCursor();
    const rows: any[] = [];

    let record;
    while ((record = await cursor.next())) {
        rows.push(record);
    }

    await reader.close();
    return rows;
}
