export function convertCsvToHtml(csv: string): string {
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
