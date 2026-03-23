export function getScripts(): string {
    return `
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
  `;
}
