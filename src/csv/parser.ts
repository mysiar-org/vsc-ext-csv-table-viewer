export function convertCsvToHtml(csv: string): string {
    const rows = csv.split(/\r?\n/).filter(r => r.trim().length > 0);

    const htmlRows = rows
        .map((row, index) => {
            const cells = parseCsvLine(row);
            const tag = index === 0 ? "th" : "td";
            const cellsHtml = cells.map(c => `<${tag}>${c}</${tag}>`).join("");
            return `<tr>${cellsHtml}</tr>`;
        })
        .join("");

    return `<table>${htmlRows}</table>`;
}

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Escaped quote ("")
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}
