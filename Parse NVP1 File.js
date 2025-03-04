/**
 * Parses the NVP1 report string and extracts unit blocks.
 * @param {string} string - The NVP1 report string.
 * @returns {Array<Object>} An array of unit blocks with extracted data.
 */
function parseNVP1Report(string) {
  const lines = string.split("\r\n");
  const unitBlockIndex = [4];
  lines.forEach((line, index) => {
    if (line.includes('WARNING:  If the "DEPR % OF UNFOUND ITEMS IN THIS FY:*" is greater than 2% at year end, you will be subject to a monetary penalty.')) {
      unitBlockIndex.push(index + 8);
    }
  });

  const unitBlocks = [];
  unitBlockIndex.forEach((startIndex, index) => {
    if (index < unitBlockIndex.length - 1) {
      unitBlocks.push(lines.slice(startIndex, unitBlockIndex[index + 1]));
    }
  });

  return unitBlocks.map(unit => {
    const unitValues = {
      code: unit[0].match(/\d{4,4}-\d{3,3}/gm)[0],
      items: unit.filter(line => line.includes("_______________________")),
      spacing: unit.find(line => line.match(/^[ -]{1,}$/gm)).split(" "),
      summary: undefined
    };

    unit.forEach((line, index) => {
      if (line.includes("UNIT PHYSICAL INVENTORY ANALYSIS")) {
        unitValues.summary = unit.slice(index + 2, index + 18)
          .map(line => line.split(":").map(item => item.replace("*", "")))
          .filter(line => line.length === 2);
      }
    });

    return unitValues;
  });
}

/**
 * Updates the certification results in the inventory database based on the unit codes.
 * @param {Array<Object>} unitCodes - An array of unit codes.
 * @param {InventoryDatabase} inventoryDatabase - The inventory database instance.
 */
function updateCertificationResults(unitCodes, inventoryDatabase) {
  const headers = inventoryDatabase.certificationKeys;
  unitCodes.forEach(unit => {
    headers.push([unit.code, unit.summary[0][1], unit.summary[1][1], unit.summary[9][1], unit.summary[10][1]]);
  });
  inventoryDatabase.certification = headers;
}

/**
 * Updates the full inventory in the inventory database based on the unit codes.
 * @param {Array<Object>} unitCodes - An array of unit codes.
 * @param {InventoryDatabase} inventoryDatabase - The inventory database instance.
 */
function updateFullInventory(unitCodes, inventoryDatabase) {
  const nvpValues = inventoryDatabase.inventoryKeys;
  unitCodes.forEach(unitCode => {
    unitCode.items.forEach(item => {
      let start = 0;
      const blocksize = unitCode.spacing.map(space => space.length);
      const lineItem = blocksize.map(block => {
        const entry = item.slice(start, start + block);
        start += block + 1;
        return entry;
      });
      lineItem.push(unitCode.code);
      nvpValues.push(lineItem);
    });
  });
  inventoryDatabase.inventory = nvpValues;
}