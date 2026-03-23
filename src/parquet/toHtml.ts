export function parquetToHtml(rows: any[]): string {
    if (rows.length === 0) {
        return "<p>No data in parquet file.</p>";
    }

    const headers = Object.keys(rows[0]);

    const headerHtml = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
    const bodyHtml = rows
        .map(r => `<tr>${headers.map(h => `<td>${r[h]}</td>`).join("")}</tr>`)
        .join("");

    return `<table>${headerHtml}${bodyHtml}</table>`;
}
