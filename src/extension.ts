import * as vscode from "vscode";
import { convertCsvToHtml } from "./csv/parser";
import { buildWebviewHtml } from "./webview/html";
import { loadParquet } from "./parquet/reader";
import { parquetToHtml } from "./parquet/toHtml";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSV Table Viewer Lite is now active.");

  //
  // CSV command
  //
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "csv-table-viewer.openCsvFromExplorer",
      async (uri: vscode.Uri) => {
        if (!uri) {
          vscode.window.showErrorMessage("No CSV file selected.");
          return;
        }

        const document = await vscode.workspace.openTextDocument(uri);
        const content = document.getText();
        openCsvAsTable(content, uri.fsPath);
      }
    )
  );

  //
  // Parquet command
  //
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "csv-table-viewer.openParquetFromExplorer",
      async (uri: vscode.Uri) => {
        if (!uri) {
          vscode.window.showErrorMessage("No Parquet file selected.");
          return;
        }

        try {
          const rows = await loadParquet(uri);
          const tableHtml = parquetToHtml(rows);

          const panel = vscode.window.createWebviewPanel(
            "csvTableViewer",
            `Parquet Table: ${uri.fsPath}`,
            vscode.ViewColumn.Active,
            { enableScripts: true }
          );

          panel.webview.html = buildWebviewHtml(tableHtml);
        } catch (err: any) {
          vscode.window.showErrorMessage("Failed to read Parquet file: " + err.message);
        }
      }
    )
  );
}

//
// CSV renderer
//
function openCsvAsTable(csvContent: string, fileName: string) {
  const panel = vscode.window.createWebviewPanel(
    "csvTableViewer",
    `CSV Table: ${fileName}`,
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );

  const tableHtml = convertCsvToHtml(csvContent);
  panel.webview.html = buildWebviewHtml(tableHtml);
}

export function deactivate() { }
