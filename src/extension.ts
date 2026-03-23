import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSV Table Viewer is now active.");

  // Command: Open CSV from active editor
  context.subscriptions.push(
    vscode.commands.registerCommand("csv-table-viewer.openCsv", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active CSV file open.");
        return;
      }

      const document = editor.document;
      const content = document.getText();
      openCsvAsTable(content, document.fileName, context);
    })
  );

  // Command: Open CSV from Explorer right-click
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
        openCsvAsTable(content, uri.fsPath, context);
      }
    )
  );
}

function openCsvAsTable(
  csvContent: string,
  fileName: string,
  context: vscode.ExtensionContext
) {
  const panel = vscode.window.createWebviewPanel(
    "csvTableViewer",
    `CSV Table: ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const html = convertCsvToHtml(csvContent);

  panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
      font-family: sans-serif;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px 10px;
    }
    th {
      font-weight: bold;
      /* no background, no hover, no cursor — your original style */
    }
  </style>
</head>
<body>
  ${html}

  <script>
  document.querySelectorAll("th").forEach((th, columnIndex) => {
    th.addEventListener("click", () => sortTable(columnIndex));
  });

  function sortTable(columnIndex) {
    const table = document.querySelector("table");
    const rows = Array.from(table.querySelectorAll("tr")).slice(1);

    const isNumeric = rows.every(row => {
      const value = row.children[columnIndex].innerText.trim();
      return value !== "" && !isNaN(value);
    });

    const sorted = rows.sort((a, b) => {
      const A = a.children[columnIndex].innerText.trim();
      const B = b.children[columnIndex].innerText.trim();

      if (isNumeric) {
        return Number(A) - Number(B);
      }
      return A.localeCompare(B);
    });

    // Determine direction
    let direction = "asc";
    if (table.dataset.sortedColumn == columnIndex && table.dataset.order === "asc") {
      sorted.reverse();
      direction = "desc";
    }

    table.dataset.sortedColumn = columnIndex;
    table.dataset.order = direction;

    // Reattach rows
    sorted.forEach(row => table.appendChild(row));

    // Clear all arrows
    document.querySelectorAll("th").forEach(th => {
      th.innerText = th.innerText.replace(/ ▲| ▼/g, "");
    });

    // Add arrow to the active column
    const activeTh = document.querySelectorAll("th")[columnIndex];
    if (direction === "asc") {
      activeTh.innerText += " ▲";
    } else {
      activeTh.innerText += " ▼";
    }
  }
</script>

</body>
</html>`;
}

function convertCsvToHtml(csv: string): string {
  const rows = csv.split(/\r?\n/).filter((r) => r.trim().length > 0);

  const htmlRows = rows
    .map((row, index) => {
      const cells = row.split(",");
      const tag = index === 0 ? "th" : "td";
      const cellsHtml = cells.map((c) => `<${tag}>${c}</${tag}>`).join("");
      return `<tr>${cellsHtml}</tr>`;
    })
    .join("");

  return `<table>${htmlRows}</table>`;
}

export function deactivate() { }
