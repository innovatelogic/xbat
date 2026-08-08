//----------------------------------------------------------------------------------------------
function include(filename, data) {
  const template = HtmlService.createTemplateFromFile(filename);
  IdM.evaluate_template(template, data);
  return template.evaluate().getContent();
}

//----------------------------------------------------------------------------------------------
function render_page(page){
  return HtmlService
    .createTemplateFromFile(page)
    .evaluate()
    .getContent();
}

//----------------------------------------------------------------------------------------------
function get_sku_name() { 
  const user = IdM.get_current_user();
  return IdM.get_config_value_throw_if_not_exist(user.sheet('.config'), "sku_name");
}

//----------------------------------------------------------------------------------------------
function get_shop_name() { return "XBat" };
function get_company_name() { return "XBat.com.ua"; }
function get_company_url() { return "https://www.xbat.com.ua"; }

//----------------------------------------------------------------------------------------------
function idm_deserialize_accounts() {
  const user = IdM.get_current_user();
  return IdM._deserialize_accounts(user.sheet("Accounts_v2"));
}

//----------------------------------------------------------------------------------------------
function add_order_impl(data){
    const user = IdM.get_current_user();
    const ss = user.spreadsheet();
    return IdM.add_order(ss, data);
}

//----------------------------------------------------------------------------------------------
function get_transfer_price(name = 'Transfer') {
  return get_config_transfer_price();
}

//----------------------------------------------------------------------------------------------
function get_config_transfer_price(){
  return get_config_value("Transfer price UAH/KG");
}

//----------------------------------------------------------------------------------------------
function idm_deserialize_articuls() {
  return IdM.deserialize_articuls();
}

//----------------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------------
function get_config_value(key)
{
  const table_name = ".config";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(table_name);
  if (!sh) throw new Error(`[get_config_value] error: "${table_name}" not found!`);

  return IdM.get_config_value(sh, key);
}

//----------------------------------------------------------------------------------------------
function get_currency_rate(curr1, curr2){

  const table_name = ".config";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(table_name);
  if (!sh) throw new Error(`[get_config_value] error: "${table_name}" not found!`);

  return IdM.get_currency_rate(sh, curr1, curr2);
}

//----------------------------------------------------------------------------------------------
function get_table_header_map(table_name, base = 0){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(table_name);
  if (!sh) throw new Error(`Sheet "${table_name}" not found!`);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  const columns = {};
  headers.forEach((name, i) => columns[name] = i + base);
  return columns;
}

//----------------------------------------------------------------------------------------------
function getColumnIndexes(table_name, base = 0) {
  return get_table_header_map(table_name, base);
}

//----------------------------------------------------------------------------------------------
function get_currency(table_name = 'Kurs UAH')
{
  //const ss = SpreadsheetApp.getActiveSpreadsheet();
  //const sh = ss.getSheetByName(table_name);
  //if (!sh) throw new Error('[get_currency_uah] failed get sheet!');

  const user = IdM.get_current_user();
  const data = IdM.get_config_value_throw_if_not_exist(user.sheet('.config'), "Currency.UAH");

  const currency = {};

  for (const [key, value] of Object.entries(data)) {
    currency[key] = value;
  }
  return currency;
}

//----------------------------------------------------------------------------------------------
function getSecrets() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    AWS_ACCESS_KEY: props.getProperty('AWS_ACCESS_KEY'),
    AWS_SECRET_KEY: props.getProperty('AWS_SECRET_KEY'),
    AWS_REGION: props.getProperty('AWS_REGION'),
    AWS_SERVICE: props.getProperty('AWS_SERVICE'),
    AWS_BUCKET : props.getProperty('AWS_BUCKET'),
    SCRIPT_ID : props.getProperty('SCRIPT_ID')
  };
}

//----------------------------------------------------------------------------------------------
function is_production() {
  const { SCRIPT_ID } = getSecrets();
  const currentScriptId = ScriptApp.getScriptId();

  // If no configured prod script -> treat as non-prod
  if (!SCRIPT_ID) {
    return false;
  }

  return currentScriptId === SCRIPT_ID;
}

//----------------------------------------------------------------------------------------------
// log to file to google drive
//----------------------------------------------------------------------------------------------
function logToTxt(message) {
  const FILE_NAME = 'app-log.txt';

  const files = DriveApp.getFilesByName(FILE_NAME);
  const file = files.hasNext()
    ? files.next()
    : DriveApp.createFile(FILE_NAME, '', MimeType.PLAIN_TEXT);

  const timestamp = new Date().toISOString();
  const oldContent = file.getBlob().getDataAsString();

  const newLine = `[${timestamp}] ${message}\n`;
  file.setContent(oldContent + newLine);
}

//----------------------------------------------------------------------------------------------
function show_articul_manager_form()
{
  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("articul_manager");

  const output = html.evaluate().setWidth(1400).setHeight(1000);
  SpreadsheetApp.getUi().showModalDialog(output, "Articul Manager");
}

//----------------------------------------------------------------------------------------------
function show_order_sidebar() {
  const template = HtmlService.createTemplateFromFile('add_order_sidebar');
  const html = template.evaluate()
    .setTitle('Додати замовлення')
    .setWidth(1000);

  SpreadsheetApp.getUi().showSidebar(html);
}

//----------------------------------------------------------------------------------------------
// Add "Order" menu on spreadsheet open
//----------------------------------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(get_config_value('.shortName'))
    .addItem('Створити', 'show_order_sidebar')
    .addItem('Розрахувати', 'show_calculation_form_new')
    .addItem('Менеджер Товарів', 'show_articul_manager_form')
    .addItem('Export all', 'export_all')
    .addToUi();

  SpreadsheetApp.getUi()
    .createMenu("Test")
    .addItem('Select env', 'TEST_SelectRoot')
    .addToUi();
}

//----------------------------------------------------------------------------------------------
function doGet(e) {
  const user = IdM.get_current_user();
  const sku_name = get_sku_name();

  const template = HtmlService.createTemplateFromFile('main');
  template.page = e.parameter.page || "add_order";
  template.sku_name = sku_name;

  return template.evaluate()
    .setTitle(sku_name)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}



