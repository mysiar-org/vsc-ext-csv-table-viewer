import * as vscode from "vscode";
import { convertCsvToHtml } from "./csv/parser";
import { buildWebviewHtml } from "./webview/html";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSV Table Viewer Lite is now active.");

  context.subscriptions.push(
    vscode.commands.registerCommand("csv-table-viewer.openCsvFromExplorer", async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage("No CSV file selected.");
        return;
      }

      const document = await vscode.workspace.openTextDocument(uri);
      const content = document.getText();
      openCsvAsTable(content, uri.fsPath);
    })
  );
}

function openCsvAsTable(csvContent: string, fileName: string) {
  const panel = vscode.window.createWebviewPanel(
    "csvTableViewer",
    `CSV Table: ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const tableHtml = convertCsvToHtml(csvContent);
  panel.webview.html = buildWebviewHtml(tableHtml);
}

export function deactivate() { }
