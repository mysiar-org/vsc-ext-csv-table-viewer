export function getStyles(): string {
    return `
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
  `;
}
