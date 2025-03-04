function makeUniqueSheet() {
  const inventoryScanSheetName = "Inventory"
  const scannedInventoryId = "1qelvR4l0PPC6syv1HAOGAIE_S4S6sIoZzZNmcxG2yzw";
  
  const inventoryDatabaseSheetName = "2500...";
  const inventoryDatabaseId = PropertiesService
    .getScriptProperties()
    .getProperty("spreadsheetId")

  const scannedInventorySpreadsheet = SpreadsheetApp.openById(scannedInventoryId)
  let sheet = scannedInventorySpreadsheet.getSheetByName(inventoryScanSheetName);
  if (sheet !== null) {
    scannedInventorySpreadsheet.deleteSheet(sheet);
  }

  SpreadsheetApp.openById(inventoryDatabaseId)
    .getSheetByName(inventoryDatabaseSheetName)
    .copyTo(scannedInventorySpreadsheet)
    .setName(inventoryScanSheetName);
}