import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSV Table Viewer is now active.");

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

  const content = `
<!DOCTYPE html>
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
    }
    #hidden-bar {
      margin-bottom: 10px;
      font-family: sans-serif;
    }
    #hidden-bar button {
      margin-right: 6px;
    }
    #context-menu {
  position: absolute;
  background: #fff !important;
  border: 1px solid #ccc !important;
  padding: 0 !important;
  display: none;
  z-index: 1000;
  font-family: sans-serif !important;
}

#context-menu > div {
  padding: 6px 12px !important;
  background: #fff !important;
  color: #000 !important;
  border: none !important;
}

#context-menu > div:hover {
  background: #ddd !important;
}
  </style>
</head>
<body>

  <div id="hidden-bar"></div>

  <div id="context-menu">
    <div id="ctx-hide">Hide column</div>
  </div>

  ${html}

<script>
  let hiddenColumns = new Set();
  let contextColumn = null;

  const contextMenu = document.getElementById("context-menu");
  const hideBtn = document.getElementById("ctx-hide");

  document.addEventListener("click", () => {
    contextMenu.style.display = "none";
  });

  document.querySelectorAll("th").forEach((th, columnIndex) => {
    th.addEventListener("click", () => sortTable(columnIndex));

    th.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      contextColumn = columnIndex;

      contextMenu.style.left = e.clientX + "px";
      contextMenu.style.top = e.clientY + "px";
      contextMenu.style.display = "block";

      return false;
    });
  });

  hideBtn.addEventListener("click", () => {
    if (contextColumn !== null) {
      hideColumn(contextColumn);
      contextMenu.style.display = "none";
    }
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
      if (isNumeric) return Number(A) - Number(B);
      return A.localeCompare(B);
    });

    let direction = "asc";
    if (table.dataset.sortedColumn == columnIndex && table.dataset.order === "asc") {
      sorted.reverse();
      direction = "desc";
    }

    table.dataset.sortedColumn = columnIndex;
    table.dataset.order = direction;

    sorted.forEach(row => table.appendChild(row));

    document.querySelectorAll("th").forEach(th => {
      th.innerText = th.innerText.replace(/ ▲| ▼/g, "");
    });

    const activeTh = document.querySelectorAll("th")[columnIndex];
    activeTh.innerText += direction === "asc" ? " ▲" : " ▼";
  }

  function hideColumn(index) {
    hiddenColumns.add(index);
    document.querySelectorAll("tr").forEach(row => {
      if (row.children[index]) row.children[index].style.display = "none";
    });
    updateHiddenBar();
  }

  function unhideColumn(index) {
    hiddenColumns.delete(index);
    document.querySelectorAll("tr").forEach(row => {
      if (row.children[index]) row.children[index].style.display = "";
    });
    updateHiddenBar();
  }

  function updateHiddenBar() {
    const bar = document.getElementById("hidden-bar");
    bar.innerHTML = "";
    hiddenColumns.forEach(index => {
      const th = document.querySelectorAll("th")[index];
      const name = th.innerText.replace(/ ▲| ▼/g, "");
      const btn = document.createElement("button");
      btn.textContent = "Show: " + name;
      btn.onclick = () => unhideColumn(index);
      bar.appendChild(btn);
    });
  }
</script>

</body>
</html>
`;

  panel.webview.html = content;
}

function convertCsvToHtml(csv: string): string {
  const rows = csv.split(/\r?\n/).filter(r => r.trim().length > 0);

  const htmlRows = rows
    .map((row, index) => {
      const cells = row.split(",");
      const tag = index === 0 ? "th" : "td";
      const cellsHtml = cells.map(c => `<${tag}>${c}</${tag}>`).join("");
      return `<tr>${cellsHtml}</tr>`;
    })
    .join("");

  return `<table>${htmlRows}</table>`;
}

export function deactivate() { }
