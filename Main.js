/**
 * The provided Google Apps Script code transforms a text NVP1 report into a structured spreadsheet.
 * It primarily involves three components:
 *
 * 1. **Google Apps Script Parts for Spreadsheet Transformation:**
 *    - `exportAsSpreadsheet`: Exports inventory data from a text file to a Google Sheet, applies formatting,
 *       and generates a pivot table.
 *    - `getExportSheet`: Retrieves or creates a Google Sheet for storing inventory data and a pivot table.
 *    - `makeRichData`: Generates rich text values for specific columns with hyperlinks.
 *    - `insertPivotTable`: Inserts a pivot table in the specified sheet based on inventory data.
 *
 * 2. **Root Folder and Database Initialization:**
 *    - `ROOT_FOLDER`: Represents the root folder where the script is located.
 *    - `DATABASE_FILE`: Represents the JSON inventory file and undergoes an integrity check.
 *    - `NVP1_FILE`: Represents the most recent NV1 file from the root folder.
 *    - `integrityCheck`: Checks the integrity of the inventory database and retrieves the file.
 *    - `initializeDatabase`: Initializes the inventory database by creating a new file.
 *
 * 3. **NVP1 Report Parsing and Spreadsheet Update:**
 *    - `parseNVP1Report`: Parses the NVP1 report string, extracts unit blocks, and their details.
 *    - `updateCertificationResults`: Updates certification results in the inventory database based on unit codes.
 *    - `updateFullInventory`: Updates the full inventory in the inventory database based on unit codes.
 *
 * 4. **InventoryDatabase Class:**
 *    - Represents the structure and data of the inventory database.
 *    - Manages loading, updating, and saving data to a JSON file.
 *    - Provides methods to get and set inventory and certification data.
 *
 * To execute the script, run the following function:
 * @function
 * @name run
 * @description Initiates the transformation of the NVP1 report into a structured spreadsheet.
 * @returns {void}
 */
function run() {
  exportAsSpreadsheet();
  makeUniqueSheet();
}
