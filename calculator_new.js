//----------------------------------------------------------------------------------------------
// Prepare calculation info
//----------------------------------------------------------------------------------------------
function prepare_calculation_info(table_name = "Orders_v2") {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== table_name) {
    SpreadsheetApp.getUi().alert(`Please open '${table_name}' sheet and select orders to calculate: exit`);
    return;
  }

}
