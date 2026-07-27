
function show_calculation_form_new()
{
  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("order_processor_dlg");

  const output = html.evaluate().setWidth(1200).setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(output, "Order Calculation");
}

function get_order_tables() { return ["Orders_v2", "Orders New"]; }

//----------------------------------------------------------------------------------------------
// Prepare calculation info
//----------------------------------------------------------------------------------------------
function prepare_calculation_info(table_name = "Orders_v2") {
  return IdM._prepare_calculation_info(table_name);
}

//----------------------------------------------------------------------------------------------
function onCalculationConfirmed(backets){
  return IdM.on_сalculation_сonfirmed(backets);
}

//----------------------------------------------------------------------------------------------
// Prepare calculation info
//----------------------------------------------------------------------------------------------
function onCompleteCalculateOperation(backets, table_name = "Orders New") {
  return IdM.on_complete_calculate_operation(backets);
}
