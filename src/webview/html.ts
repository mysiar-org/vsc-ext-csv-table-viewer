import { getStyles } from "./styles";
import { getScripts } from "./scripts";

export function buildWebviewHtml(tableHtml: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${getStyles()}
  </style>
</head>
<body>

  <div id="hidden-bar"></div>

  <div id="context-menu">
    <div id="ctx-hide">Hide column</div>
  </div>

  ${tableHtml}

  <script>
    ${getScripts()}
  </script>

</body>
</html>
`;
}
