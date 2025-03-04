## Overview
**NVP1 Parser** is a Google Apps Script that transforms an **NVP1 text report** into a structured **Google Spreadsheet**. It processes inventory data, formats it properly, and generates useful pivot tables for analysis.

## Features
- **Automated Parsing**: Extracts inventory data from an NVP1 report.
- **Spreadsheet Export**: Formats and organizes inventory data into a Google Sheet.
- **Pivot Table Generation**: Creates an overview of inventory data for better insights.
- **Database Management**: Loads, updates, and saves inventory data as a JSON file in Google Drive.
- **Unique Sheet Creation**: Maintains a dedicated sheet for scanned inventory.

## Files
- `Initialize.js` – Initializes the script, sets up the database, and retrieves the latest NVP1 file.
- `Classes.js` – Contains the `InventoryDatabase` class for managing inventory data.
- `Parse NVP1 File.js` – Extracts relevant inventory data from an NVP1 report.
- `Export As Spreadsheet.js` – Exports parsed inventory data into a structured Google Spreadsheet.
- `Unique Sheet.js` – Creates a separate sheet for scanned inventory.
- `Main.js` – The entry point to execute the script.

## Setup & Installation
1. **Open Google Apps Script**:
   - Navigate to [Google Apps Script](https://script.google.com/) and create a new project.
   - Copy and paste the provided script files into your project.

2. **Grant Permissions**:
   - The script requires access to Google Drive and Google Sheets.
   - When you run it for the first time, follow the authorization prompts.

3. **Configure Properties**:
   - The script uses **PropertiesService** to store spreadsheet and database IDs.
   - Ensure that `spreadsheetId` and `database_inventory` are properly set.

4. **Place an NVP1 Report in Google Drive**:
   - The script automatically detects the most recent NVP1 file in the root folder.

## Usage
### Running the Script
To execute the script, call:
```javascript
run();

This will:
1. Parse the latest NVP1 report.
2. Export the structured data to a Google Spreadsheet.
3. Generate a pivot table for analysis.
4. Maintain a record of scanned inventory.

### Exporting as a Spreadsheet
Run:
```javascript
exportAsSpreadsheet();
```
This function will:
- Extract inventory data.
- Format the sheet.
- Apply conditional formatting and filtering.

### Creating a Unique Inventory Sheet
Run:
```javascript
makeUniqueSheet();
```
This will create a copy of the **Inventory Database** sheet in the scanned inventory spreadsheet.
