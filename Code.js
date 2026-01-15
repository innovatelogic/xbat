//----------------------------------------------------------------------------------------------
// Add "Order" menu on spreadsheet open
//----------------------------------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Замовлення')
    .addItem('Створити', 'showOrderForm')
    .addItem('Розрахувати', 'showCalculationForm')
    .addToUi();
}

//----------------------------------------------------------------------------------------------
// Show the order form as SIDEBAR
function showOrderForm() {
  const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Додати')
      .setWidth(800);  // Sidebar title
  SpreadsheetApp.getUi().showSidebar(html);
}

//----------------------------------------------------------------------------------------------
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//----------------------------------------------------------------------------------------------
function getAllAccounts()
{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Bank Accaunts');
  if (!sh) throw new Error('Sheet "Bank Accaunts" not found!');

  const lastRow = sh.getLastRow();
  if (lastRow < 1) return [];

  // A → 1 column
  const data = sh.getRange(1, 1, lastRow, 1).getValues();

  const accounts = [];
  data.forEach(row => {
    accounts.push({label: `${row[0]}`});
  });
  return accounts;
}

//----------------------------------------------------------------------------------------------
function getAccountsBackets()
{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Bank Accaunts');
  if (!sh) throw new Error('Sheet "Bank Accaunts" not found!');

  const lastRow = sh.getLastRow();
  if (lastRow < 1) return new Map();

  const backets = new Map();
  const data = sh.getRange(1, 1, lastRow, 2).getValues();

  data.forEach(row => {
     const account = row[0];
     const backet_id = row[1];

     if (!backets.has(backet_id)) backets.set(backet_id, []);
     backets.get(backet_id).push(account);
  });

  return backets;
}

//----------------------------------------------------------------------------------------------
function getAllItems() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Articuls');
  if (!sh) throw new Error('Sheet "Articuls" not found!');

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  // A–K → 11 columns
  const data = sh.getRange(2, 1, lastRow - 1, 11).getValues();

  const items = [];

  data.forEach(row => {
    const id = row[1];              // B
    const name = row[2];            // C
    const bare_price = row[6];     // G
    const default_price = row[8] // I
    const priceRuleRaw = row[9]; // J
    const count_available = row[10]; // K

    let price_rule = null;

    if (priceRuleRaw && typeof priceRuleRaw === "string") {
      try {
        price_rule = JSON.parse(priceRuleRaw);
      } catch (e) {
        price_rule = null;
      }
    }

    if (id && name) {
      items.push({
        id,
        name,
        bare_price,
        default_price,
        price_rule,
        count_available,
        label: `${name} (${id}) ${bare_price}`
      });
    }
  });

  return items;
}

 function UntitledMacro() {
var spreadsheet = SpreadsheetApp.getActive();
spreadsheet.getActiveSheet().insertRowsBefore(spreadsheet.getActiveRange().getRow(), 1);
spreadsheet.getActiveRange().offset(0, 0, 1,          spreadsheet.getActiveRange().getNumColumns()).activate();
};

//----------------------------------------------------------------------------------------------
// Add order with multiple positions
//----------------------------------------------------------------------------------------------
function addOrder(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let orderSheet = ss.getSheetByName('Orders New');

  if (!orderSheet) throw new Error('Sheet "Orders New" not found!');

  const { client_info, payment, notes, total_price, positions } = data;

  const timestamp = new Date();
  
  const orderId = 'ORD-' + timestamp.getTime();

  // Remove filter if it exists
  const filter = orderSheet.getFilter();
  if (filter) filter.remove();

   const last = orderSheet.getLastRow();
  
  // Add a truly blank separation row IF there is at least 1 order already

  const writeCols = 13;

  // Insert one row per item position
  positions.forEach((pos, index) => {

    const row_values = [
      timestamp,
      orderId,
      pos.item_id,
      pos.item_name,
      pos.count,
      null,
      index === 0 ? client_info : "",
      index === 0 ? notes : "",
      payment,
      'Створено',
      pos.pos_price,
      pos.pos_price - pos.profit,
      pos.profit,
      pos.bare_price
    ];

    orderSheet.appendRow(row_values);
  });

  // ---------------------------------------------------------------
  // ADD SUMMARY ROW (total only in column F) + COLOR #8192d4
  // ---------------------------------------------------------------
  const lastRowBefore = orderSheet.getLastRow();

  // Insert new row AFTER the last row with order items
  orderSheet.insertRowAfter(lastRowBefore);

  const sumRow = lastRowBefore + 1;
  const cols = orderSheet.getLastColumn();

  // ensure row is empty
  orderSheet.getRange(sumRow, 1, 1, cols).clearContent().clearFormat();

  // write total into column F
  orderSheet.getRange(sumRow, 6).setValue(total_price);

  // color whole row
  orderSheet.getRange(sumRow, 1, 1, cols)
            .setBackground("#8192d4");

  // optional: thinner row
  orderSheet.setRowHeight(sumRow, 14);
  
  updateArticulCounts(positions);

  return `Order ${orderId} added successfully! Total: ${total_price}`;
}

//----------------------------------------------------------------------------------------------
// Update counts
//----------------------------------------------------------------------------------------------
function updateArticulCounts(positions)
{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Articuls');
  if (!sh) throw new Error('Sheet "Articuls" not found!');

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  // Read all IDs (column B) and counts (column K)
  const data = sh.getRange(2, 2, lastRow - 1, 10).getValues(); // B-K → 10 columns

  const idIndex = 0;          // B → ID
  const countIndex = 9;       // K → count_available

  // Create a map of ID → row index in sheet
  const idRowMap = {};
  data.forEach((row, i) => {
    if (row[idIndex]) idRowMap[row[idIndex]] = i;
  });

   // Update counts in memory
  positions.forEach(pos => {
    const rowIndex = idRowMap[pos.item_id];
    if (rowIndex !== undefined) {
      const currentCount = data[rowIndex][countIndex];
      if (typeof currentCount === "number" && typeof pos.count === "number") {
        data[rowIndex][countIndex] = currentCount - pos.count;
      }
    }
  });

  // Write updated counts back to sheet
  const countRange = sh.getRange(2, 11, lastRow - 1, 1); // column K
  const updatedCounts = data.map(row => [row[countIndex]]);
  countRange.setValues(updatedCounts);
}


