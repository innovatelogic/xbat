
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

  console.log('[prepare_calculation_info]');

  const user = IdM.get_current_user();
  const sh = user.sheet(table_name); 

  const sh_proc = user.sheet("Processing");

  const accounts = IdM._deserialize_accounts(user.sheet("Accounts_v2"));
  const buckets = IdM.accounts_to_buckets_map(accounts);

  // TODO: consider add rules check on data source (not operation)
  //if (!curr_user || !curr_user.has_role(UserRole.ACCOUNTANT | UserRole.OWNER)) {
  //  return null;
  //}

  return IdM._prepare_calculation_info(sh, sh_proc, buckets);
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
