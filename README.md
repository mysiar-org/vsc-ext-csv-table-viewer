# CSV Table Viewer Lite
A lightweight Visual Studio Code extension for displaying CSV files as clean, readable HTML tables.

---

## 📌 Overview

**CSV Table Viewer Lite** makes it easy to inspect CSV files directly inside VS Code.  
Instead of reading raw comma‑separated text, you can instantly open any `.csv` file as a formatted table in a side panel.

Perfect for developers, testers, analysts, and anyone working with tabular data.

---

## ✨ Features

### ✔ Open from Explorer
Right‑click any `.csv` file in the Explorer and choose:

**Open CSV in Table Viewer**

The file opens immediately in a side panel — no dialogs, no file picker.

### ✔ Clean HTML table rendering
Your CSV is displayed as a simple, readable table:

- Header row styled automatically  
- Borders and spacing for clarity  
- No external dependencies  
- Works fully offline  

### ✔ Column sorting
Click any column header to sort the table:

- Ascending / descending toggle  
- Automatic numeric vs. text sorting  
- Visual arrow indicator (▲ ▼)  

Sorting works on any column, even after hiding/unhiding.

### ✔ Hide and unhide columns
Right‑click a column header to open a small context menu:

- **Hide column** removes it from view  
- Hidden columns appear in a toolbar above the table  
- Click a button to **unhide** any column  

Great for focusing on the data that matters.

### ✔ Lightweight and fast
The extension uses a minimal CSV → HTML converter with no external libraries.

### ✔ Works with any CSV
Supports:

- Standard comma‑separated files  
- Files with or without headers  
- Large files (limited only by VS Code memory)

---

## 📦 Installation

### **From the VS Code Marketplace**
Search for:

**CSV Table Viewer Lite**

and click **Install**.

### **From a `.vsix` file**
If you prefer manual installation:

1. Open the Command Palette  
2. Run **Extensions: Install from VSIX…**  
3. Select the `.vsix` file  

---

## 🚀 Usage

### **From Explorer**
1. Right‑click a `.csv` file  
2. Select **Open CSV in Table Viewer**

---

## 🛠 Notes
- Sorting and hide/unhide work entirely inside the webview  
- Your CSV file is never modified  
- The viewer is read‑only by design  

---

## ❤️ Feedback
If you have ideas for improvements (filters, resizing, sticky headers), feel free to suggest them!
