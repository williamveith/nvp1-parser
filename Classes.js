class InventoryDatabase {
  constructor() {
    /**
     * The last updated timestamp of the inventory database.
     * @type {number}
     * @private
     */
    this._lastUpdated = undefined;
    /**
     * The ID of the NVP1 file from which the inventory was updated.
     * @type {string}
     * @private
     */
    this._updatedFrom = undefined;
    /**
     * The keys for the inventory table.
     * @type {Array<Array<string>>}
     * @private
     */
    this._inventoryKeys = [
      [
        "DESCRIPTION",
        "CURRENT ITEM NO.",
        "OLD ITEM NO.",
        "SERIAL NUMBER",
        "FOUND",
        "BLDG",
        "FLOOR",
        "ROOM",
        "MISSING-STOLEN,DATE",
        "ORIGINAL COST",
        "DEPRECIATED AMOUNT",
        "O W N",
        "ORIGINAL PO NO.",
        "COMMENTS",
        "DATE ACQUIRED",
        "UNIT",
      ],
    ];
    /**
     * The keys for the certification table.
     * @type {Array<Array<string>>}
     * @private
     */
    this._certificationKeys = [
      [
        "Unit",
        "# of items FOUND",
        "Total # of items",
        "DEPR Value Unfound",
        "DEPR total value",
      ],
    ];
    /**
     * The inventory data.
     * @type {Object}
     * @private
     */
    this._inventory = undefined;
    /**
     * The certification data.
     * @type {Object}
     * @private
     */
    this._certification = undefined;
  }
  /**
   * Loads the inventory database from the DATABASE_FILE.
   */
  get load() {
    const contentString = DATABASE_FILE.getBlob().getDataAsString();
    const loadedData = JSON.parse(contentString, (key, value) =>
      value === null ? undefined : value
    );
    const keys = Object.keys(this);
    keys.forEach((key) =>
      loadedData.hasOwnProperty(key)
        ? (this[key] = loadedData[key])
        : Logger.log(`Loaded File did not have ${key}`)
    );
    this.update;
  }
  /**
   * Updates the inventory database with the latest NVP1 file data.
   */
  get update() {
    if (NVP1_FILE === undefined) {
      Logger.log("Update could not run. No NVP1 File was found");
      return;
    }
    const dateNVP1Updated = NVP1_FILE.getLastUpdated().getTime();
    const nvp1FileId = NVP1_FILE.getId();
    const nvp1FileName = NVP1_FILE.getName()
    if (
      this._lastUpdated < dateNVP1Updated ||
      this._updatedFrom !== nvp1FileId
    ) {
      const string = NVP1_FILE.getBlob().getDataAsString();
      const unitCodes = parseNVP1Report(string);
      updateCertificationResults(unitCodes, this);
      updateFullInventory(unitCodes, this);
      this.save;
      Logger.log(
        `Database was updated with newer NVP1 File. File Name: ${nvp1FileName} | File ID: ${nvp1FileId}`
      );
    } else {
      Logger.log(`Database is currently up to date. File Name: ${nvp1FileName} | File ID: ${nvp1FileId}`);
    }
  }
  /**
   * Saves the inventory database to the DATABASE_FILE.
   */
  get save() {
    const today = new Date();
    this._lastUpdated = today.getTime();
    this._updatedFrom = NVP1_FILE === undefined ? undefined : NVP1_FILE.getId();
    const json = JSON.stringify(this, (key, value) =>
      value === undefined ? null : value
    );
    DATABASE_FILE.setContent(json);
  }
  /**
   * Gets the inventory keys.
   * @returns {Array<Array<string>>} The inventory keys.
   */
  get inventoryKeys() {
    return this._inventoryKeys.map((key) => key);
  }
  /**
   * Gets the certification keys.
   * @returns {Array<Array<string>>} The certification keys.
   */
  get certificationKeys() {
    return this._certificationKeys.map((key) => key);
  }
  /**
   * Gets the inventory data.
   * @returns {Array<Array<*>>} The inventory data.
   */
  get inventory() {
    return Object.values(this._inventory)
      .flat()
      .map((entry) => Object.values(entry));
  }
  /**
   * Sets the inventory data.
   * @param {Array<Array<string>>} fullInventory - The full inventory data.
   */
  set inventory(fullInventory) {
    const cleanedValues = fullInventory.map((row) => {
      return row.map((item) => {
        return item
          .trim()
          .replace(/^\.{1}0{2}$/gm, "0.00")
          .replace("_______________________", "")
          .replace(/(?<=[0-9]{4})-{1}(?=[0-9]{3})/gm, "");
      });
    });
    this._inventory = this.arrayToObject(cleanedValues, 1);
  }
  /**
   * Sets the certification data.
   * @param {Array<Array<string>>} certificationData - The certification data.
   */
  set certification(certificationData) {
    const cleanedValues = certificationData.map((row) => {
      return row.map((item) => {
        return item
          .trim()
          .replace(/^\.{1}0{2}$/gm, "0.00")
          .replace(/(?<=[0-9]{4})-{1}(?=[0-9]{3})/gm, "");
      });
    });
    this._certification = this.arrayToObject(cleanedValues, 0);
  }
  /**
   * Converts a 2D array into an object using the specified key index.
   * @param {Array<Array<*>>} array2D - The 2D array to convert.
   * @param {number} keyIndex - The index of the key in each row.
   * @returns {Object} The converted object.
   */
  arrayToObject(array2D, keyIndex) {
    const obj = {};
    const headers = array2D.shift();
    array2D.forEach((row) => {
      const entry = row.reduce(function (result, field, index) {
        result[headers[index]] = field;
        return result;
      }, {});
      obj.hasOwnProperty(row[keyIndex])
        ? obj[row[keyIndex]].push(entry)
        : (obj[row[keyIndex]] = [entry]);
    });
    return Object.keys(obj)
      .sort()
      .reduce((res, key) => ((res[key] = obj[key]), res), {});
  }
}
