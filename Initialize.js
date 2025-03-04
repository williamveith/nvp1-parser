/**
 * The root folder where the script is located.
 * @type {GoogleAppsScript.Drive.Folder}
 */
const ROOT_FOLDER = DriveApp.getFileById(ScriptApp.getScriptId()).getParents().next();

/**
 * The json inventory file.
 * @type {GoogleAppsScript.Drive.File}
 */
const DATABASE_FILE = integrityCheck();

/**
 * Retrieves the most recent NV1 file from the root folder.
 * @type {GoogleAppsScript.Drive.File|undefined}
 */
const NVP1_FILE = (() => {
  const files = ROOT_FOLDER.getFilesByType("text/plain");
  if (!files.hasNext()) {
    Logger.log("There is no NV1 File Detected in the root directory");
    return undefined;
  }

  let mostRecentFile;
  let mostRecentDate = new Date(0);

  while (files.hasNext()) {
    const file = files.next();
    const createdDate = file.getDateCreated();
    if (createdDate > mostRecentDate) {
      mostRecentFile = file;
      mostRecentDate = createdDate;
    }
  }

  return mostRecentFile;
})();

/**
 * Checks the integrity of the inventory database and retrieves the file.
 * @returns {GoogleAppsScript.Drive.File} The inventory database file.
 */
function integrityCheck() {
  const databaseId = PropertiesService.getScriptProperties().getProperty("database_inventory");
  let database = null;

  if (databaseId) {
    try {
      database = DriveApp.getFileById(databaseId);
      if (database.isTrashed()) {
        database.setTrashed(false);
      }
    } catch (e) {
      Logger.log("Error accessing the existing Inventory Database. Initializing a new database.");
    }
  }

  if (!database) {
    Logger.log("No Inventory Database existed. Initializing a new database.");
    database = initializeDatabase();
  }

  return database;
}

/**
 * Initializes the inventory database by creating a new file.
 * @returns {GoogleAppsScript.Drive.File} The initialized database file.
 */
function initializeDatabase() {
  const databaseContent = JSON.stringify(new InventoryDatabase(), (key, value) =>
    value === undefined ? null : value
  );
  const databaseName = "database_inventory.json";
  const databaseId = ROOT_FOLDER.createFile(databaseName, databaseContent).getId();
  PropertiesService.getScriptProperties().setProperty("database_inventory", databaseId);
  return DriveApp.getFileById(databaseId);
}