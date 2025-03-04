/**
 * Export the inventory data as a spreadsheet.
 */
function exportAsSpreadsheet() {
  // Get the export spreadsheet
  const { dataSheet, pivotTableSheet } = getExportSheet();

  // Load inventory data
  const inventoryDatabase = new InventoryDatabase();
  inventoryDatabase.load;

  const headers = inventoryDatabase.inventoryKeys;
  const data = inventoryDatabase.inventory;
  const richData = makeRichData(headers, data);

  // Set Header Values and Format
  dataSheet.getRange(1, 1, headers.length, headers[0].length)
    .setNumberFormat("@")
    .setValues(headers)
    .setFontWeight("bold")
    .setHorizontalAlignment('left')
    .setBackground("#f3f3f3");

  // Set Body Values and Format
  dataSheet.getRange(1 + headers.length, 1, data.length, data[0].length)
    .setNumberFormat("@")
    .setValues(data)
    .setHorizontalAlignment('right');

  // Update Some Body Values with External Record Links
  richData.forEach(column => column.setRichTextValues(dataSheet));

  // Format Description Column
  dataSheet.getRange(`A${headers.length + 1}:A`).setHorizontalAlignment('left');

  // Format Money Columns
  dataSheet.getRange(`J${headers.length + 1}:K`).setNumberFormat("$#,##0.00");

  // Format Date Columns
  dataSheet.getRange(`O${headers.length + 1}:O`).setNumberFormat("yyyy-mm-dd");

  // Apply general Formatting & Filter
  dataSheet.getDataRange()
    .setFontFamily("Times New Roman")
    .setFontSize(12)
    .createFilter();
  dataSheet.setFrozenRows(1);

  // Resize Columns 
  dataSheet.autoResizeColumns(1, headers[0].length);
  headers[0].forEach((header, index) => dataSheet.setColumnWidth(index + 1, dataSheet.getColumnWidth(index + 1) + 25));

  // Hide Columns
  ["C1", "G1", "I1", "L1", "N1"].forEach(column => dataSheet.hideColumn(dataSheet.getRange(column)));

  insertPivotTable(dataSheet, pivotTableSheet);
}

/**
 * Retrieves the export sheet for the inventory data.
 * @returns {object} An object containing the data sheet and pivot table sheet.
 * @property {GoogleAppsScript.Spreadsheet.Sheet} dataSheet - The sheet for the inventory data.
 * @property {GoogleAppsScript.Spreadsheet.Sheet} pivotTableSheet - The sheet for the pivot table.
 */
function getExportSheet() {
  let spreadsheet = undefined;
  const spreadsheetName = "Inventory Database";
  const dataSheetName = "2500...";
  const pivotTableSheetName = "Pivot Table";
  try {
    const spreadsheetId = PropertiesService
      .getScriptProperties()
      .getProperty("spreadsheetId");
    spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  } catch (e) {
    spreadsheet = SpreadsheetApp.create(spreadsheetName);
    DriveApp.getFileById(spreadsheet.getId()).moveTo(ROOT_FOLDER);
    PropertiesService
      .getScriptProperties()
      .setProperty("spreadsheetId", spreadsheet.getId());
    return {
      dataSheet: sheets[0].setName(dataSheetName),
      pivotTableSheet: spreadsheet.insertSheet(pivotTableSheetName)
    };
  }
  const sheets = [dataSheetName, pivotTableSheetName].map(name => {
    let sheet = spreadsheet.getSheetByName(name);
    if (sheet !== null) {
      spreadsheet.deleteSheet(sheet)
    }
    return spreadsheet.insertSheet(name)
  })
  return {
    "dataSheet": sheets[0],
    "pivotTableSheet": sheets[[1]]
  }
}

/**
 * Generates rich text values for specific columns based on the provided headers and data.
 * @param {Array<Array<string>>} headers - The headers of the data.
 * @param {Array<Array<string>>} data - The data.
 * @returns {Array<object>} The rich data objects containing information about the columns with rich text values.
 */
function makeRichData(headers, data) {
  const flatHeaders = headers.flat();
  const linkTypes = [
    {
      column: flatHeaders.indexOf("UNIT"),
      getLink: id => `https://utdirect.utexas.edu/apps/frms/inventory/item/list/${id}/`
    },
    {
      column: flatHeaders.indexOf("CURRENT ITEM NO."),
      getLink: id => `https://utdirect.utexas.edu/apps/frms/inventory/item/detail/${id}/`
    },
    {
      column: flatHeaders.indexOf("ORIGINAL PO NO."),
      getLink: id => `https://utdirect.utexas.edu/pointplus/index.WBX?doc_search=Y&component=0&page=rs&page_title=&ut_req_nbr=&pd1_doc_id=&search_by=PO&purch_ctr=&dept_req_nbr=&po_nbr=${id}&document_id=&bid_inv_nbr=`
    }
  ];

  const richData = linkTypes.map(linkType => {
    const columnNumber = linkType.column + 1;
    const values = data.map(row => {
      const value = row[linkType.column];
      return [
        SpreadsheetApp.newRichTextValue()
          .setText(value)
          .setLinkUrl(linkType.getLink(value))
          .build()
      ];
    });

    return {
      startRow: headers.length + 1,
      columnNumber,
      values,
      /**
       * Sets the rich text values in the given sheet.
       * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to set the rich text values.
       */
      setRichTextValues(sheet) {
        sheet.getRange(this.startRow, this.columnNumber, this.values.length, this.values[0].length)
          .setRichTextValues(this.values);
      }
    };
  });

  return richData;
}

/**
 * Inserts a pivot table in the specified pivotTableSheet based on the data in the dataSheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} dataSheet - The sheet containing the data.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} pivotTableSheet - The sheet where the pivot table will be inserted.
 */
function insertPivotTable(dataSheet, pivotTableSheet) {
  const pivotTable = pivotTableSheet
    .getRange("A1")
    .createPivotTable(dataSheet.getDataRange());

  pivotTable.addRowGroup(16).hideRepeatedLabels().setDisplayName("Unit Code");
  pivotTable.addRowGroup(2).hideRepeatedLabels().showTotals(false).setDisplayName("Inventory No.");
  pivotTable.addRowGroup(1).showRepeatedLabels().showTotals(false).setDisplayName("Description");
  pivotTable.addRowGroup(10).hideRepeatedLabels().showTotals(false).setDisplayName("Orig. Cost");
  pivotTable.addRowGroup(11).hideRepeatedLabels().showTotals(false).setDisplayName("DEPR. Amt.");
  pivotTable.addPivotValue(10, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName("Orig. Cost SUM");
  pivotTable.addPivotValue(11, SpreadsheetApp.PivotTableSummarizeFunction.SUM).setDisplayName("DEPR. Amt. SUM");

  pivotTableSheet.getDataRange()
    .setFontFamily("Times New Roman")
    .setFontSize(12)
    .applyRowBanding(SpreadsheetApp.BandingTheme.CYAN, true, true);

  const numberOfColumns = pivotTableSheet.getLastColumn();
  pivotTableSheet.autoResizeColumns(1, numberOfColumns);
  for (let i = 0; i < numberOfColumns; i++) {
    pivotTableSheet.setColumnWidth(i + 1, pivotTableSheet.getColumnWidth(i + 1) + 15);
  }
}