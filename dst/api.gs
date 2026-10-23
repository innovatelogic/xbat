

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
function add_order_terminal(data){
  const user = IdM.get_current_user();
  const ss = user.spreadsheet();

  const table_name = 'dev.orders_v3';
  let order_sheet = ss.getSheetByName(table_name);

  if (!order_sheet) {
    throw new Error('[add_order] Sheet not found!');
  }

  const headers = IdM.get_table_header_map_sheet(orderSheet, 1);

  const { client_info, payment, notes, total_price, positions } = data;

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
  console.time('idm_deserialize_articuls');
  const result = _deserialize_articuls();
  console.timeEnd('idm_deserialize_articuls');
  return result;
}

//----------------------------------------------------------------------------------------------
function to_clientt_object(value) {
  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([key, val]) => [
        key,
        to_clientt_object(val)
      ])
    );
  }

  if (Array.isArray(value)) {
    return value.map(toClientObject);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        to_clientt_object(val)
      ])
    );
  }

  return value;
}

//----------------------------------------------------------------------------------------------
function idm_deserialize_articuls_policy() {
  console.time('idm_deserialize_articuls');

  const data = build_items();

  const articuls = {};
  data.forEach(a => {
    const ctx = a.context;
    articuls[String(ctx.OFFER_ID)] = ctx;
  });

  const user = IdM.get_current_user();

  let context = {
    ARTICULS : articuls,
    CURR_USR_ID : user.id,
    CURR_USR_GROUP : user.group,
    USER : {
      GROUP : user.group,
      ROLE: user.role,
    },
    CURR_CODE : "UAH",
  };

  const raw_policy = get_config_value(".UserTradePolicy");
  const res = xflow.process_xml_engine(raw_policy, context);

  console.timeEnd('idm_deserialize_articuls');

  return to_json_compatible(res.context);
}

//----------------------------------------------------------------------------------------------
function to_json_compatible(value) {
  const tag = Object.prototype.toString.call(value);
  if (tag === "[object Map]") {
    const result = {};

    for (const [key, val] of value.entries()) {
      result[String(key)] = to_json_compatible(val);
    }

    return result;
  }

  if (Array.isArray(value)) {
    return value.map(to_json_compatible);
  }

  if (value !== null && typeof value === "object") {
    const result = {};

    for (const [key, val] of Object.entries(value)) {
      result[key] = to_json_compatible(val);
    }

    return result;
  }

  return value;
}

//----------------------------------------------------------------------------------------------
function _deserialize_articuls()
{
  console.time('_deserialize_articuls');

  const user = IdM.get_current_user();

  const ss = user.sheet('Articuls_v2');

  const data = IdM.deserialize_data(ss);
  
  const headers = IdM.get_table_header_map_sheet(ss);

  const _idx_offer_id = headers['offer_id'];
  const _idx_brand = headers['Brand'];
  const _idx_name = headers['Name'];
  const _idx_market_name = headers['Market Name'];
  const _idx_condition = headers['Condition'];
  const _idx_available = headers['Available'];
  const _idx_bare_price = headers['Ціна поставки (UAH)'];
  const _idx_sell_price = headers['Sell Price (UA)'];
  const _idx_sell_price_ua = headers['Sell Price (UA)'];
  const _idx_sell_price_pl = headers['Sell Price (UA)'];
  const _idx_count = headers['Count'];
  const _idx_weight = headers['Weight (gr)'];
  const _idx_type = headers['Type'];
  const _idx_images_raw = headers['Images'];
  const _idx_export_rules_raw = headers['Export Rules'];
  const _idx_price_rules_raw = headers['Price rule(UA)'];
  const _idx_price_rules_UA_raw = headers['Price rule(UA)'];
  const _idx_price_rules_PL_raw = headers['Price rule(PL)'];

  let articuls = [];

  data.forEach(row => {

      const context = {
        offer_id: row[_idx_offer_id],
        brand: row[_idx_brand],
        name: row[_idx_name],
        market_name: row[_idx_market_name],
        condition: row[_idx_condition],
        available: row[_idx_available],
        bare_price: row[_idx_bare_price],
        sell_price: row[_idx_sell_price],
        sell_price_ua: row[_idx_sell_price_ua],
        sell_price_pl: row[_idx_sell_price_pl],
        count: row[_idx_count],
        weight: row[_idx_weight] / 1000,
        type: row[_idx_type],
        images_raw : row[_idx_images_raw],
        export_rules_raw : row[_idx_export_rules_raw],
        price_rules_raw: row[_idx_price_rules_raw],   // default UA price rule
        price_rules_UA_raw: row[_idx_price_rules_UA_raw],
        price_rules_PL_raw: row[_idx_price_rules_PL_raw],
      };

      articuls.push(IdM.alloc_new_Articul(context));
  });
  console.timeEnd('_deserialize_articuls');
  return articuls;
}

//----------------------------------------------------------------------------------------------
function build_articul_context(articul){
  if (!articul || !fields_name){
      throw new Error("[build_object_context] error: invalid param ");
  }

  let context = articul.contex();


}

//----------------------------------------------------------------------------------------------
function show_calculation_form_new()
{
  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("order_processor_dlg");

  const output = html.evaluate().setWidth(1200).setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(output, "Order Calculation");
}

//----------------------------------------------------------------------------------------------
function game()
{
  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("game");

  const output = html.evaluate().setWidth(1500).setHeight(1500);
  SpreadsheetApp.getUi().showModalDialog(output, "Game");
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
    .addItem('Sales Terminal', 'open_sales_terminal_sidebar')
    .addItem('Game', 'game')
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

//----------------------------------------------------------------------------------------------
function build_items() {
  console.time('[build_items] full');

  const user = IdM.get_current_user();
  const sh = user.sheet("Articuls_v2");

  console.time('[build_items] deserialize_data');
  const data = IdM.deserialize_data(sh);
  console.timeEnd('[build_items] deserialize_data');

  const headers = IdM.get_table_header_map_sheet(sh);

  const idx_obj_ctxt = headers['Price rule(PL)'];
  const idx_object_id = headers['offer_id'];

  // 1. Index all records by key (coerced to string)
  const itemMap = new Map();
  data.forEach(row => {
    const rawId = row[idx_object_id];
    if (rawId !== undefined && rawId !== null && String(rawId).trim() !== "") {
      itemMap.set(String(rawId).trim(), row);
    }
  });

  // Fast regex to extract var-base attribute
  function extract_base_id(xmlStr) {
    if (!xmlStr) return null;
    const match = xmlStr.match(/var-base=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
  }

  // Caches
  const contextCache = new Map(); // id -> fully compiled context
  const compiledResults = [];
  const visiting = new Set();     // Cycle detection guard

  /**
   * Evaluates an item by ensuring its base item is evaluated first,
   * regardless of position in the data array.
   */
  function evaluate_item(itemId) {
    // Return early if already compiled
    if (contextCache.has(itemId)) {
      return contextCache.get(itemId);
    }

    const row = itemMap.get(itemId);
    if (!row) return null;

    // Cycle detection guard (A -> B -> A)
    if (visiting.has(itemId)) {
      Logger.log("Warning: Circular dependency detected at offer_id: " + itemId);
      return null;
    }
    visiting.add(itemId);

    const rawXml = row[idx_obj_ctxt];
    const baseId = extract_base_id(rawXml);

    let parentContext = null;

    // If this item has a base item and it exists in the data, resolve base first
    if (baseId && baseId !== itemId && itemMap.has(baseId)) {
      parentContext = evaluate_item(baseId);
    }

    // Initialize current item's context
    let context = IdM.fill_item_context_not_null(headers, row);
    context['CURR_USR_ID'] = user.id;
    context['CURR_USR_GROUP'] = user.ctx.group;
    context['CURR_CODE'] = "UAH";

    // Inherit from base item if present
    if (parentContext) {
      // Base variables flow down; current row fields take precedence if collisions occur
      context = Object.assign({}, parentContext, context);
    }

    let finalXml = rawXml;

    // Execute rule engine on this node
    if (rawXml && rawXml.trim() !== "") {
      console.time('[build_items] build xml');
      const result = xflow.process_xml_engine(rawXml, context);
      console.timeEnd('[build_items] build xml');
      context = result.context;
      finalXml = result.cleanXml;
    }

    // Cache the resolved context for any future children
    contextCache.set(itemId, context);
    visiting.delete(itemId);

    compiledResults.push({
      context: context,
      articul: itemMap.get(itemId)
    });

    return context;
  }

  // 2. Evaluate all records (order in data does not matter)
  for (const itemId of itemMap.keys()) {
    evaluate_item(itemId);
  }

  console.timeEnd('[build_items] full');

  //Logger.log("Processed " + compiledResults.length + " items across all chains.");
  return compiledResults;
}

//----------------------------------------------------------------------------------------------
function open_sales_terminal() {

  const html = IdMSalesTerminal.open_sales_terminal_html();

  const output = HtmlService
    .createHtmlOutput(html)
    .setWidth(1400)
    .setHeight(1000);

  SpreadsheetApp
    .getUi()
    .showModalDialog(output, "Sales Terminal");
}

//----------------------------------------------------------------------------------------------
function open_sales_terminal_sidebar() {
  const html = IdMSalesTerminal.get_sales_terminal_sidebar(get_template_data());
  SpreadsheetApp.getUi().showSidebar(html);
}

//----------------------------------------------------------------------------------------------
function get_template_data() {
  const user = IdM.get_current_user();
  if (!user) { throw new Error('[get_template_data] unknown user'); }

  return {
    sku_name: get_sku_name(),
    user_id: user.user_id,
    user_role: user.role,
    user_group: user.group,
    user: { id : user.user_id,
            role : user.role,
            group : user.group,
            accounts : user.accounts,
    },
    t_user_id: user.user_id
  };
}

//----------------------------------------------------------------------------------------------
function create_page_template(page, data) {
  const template = HtmlService.createTemplateFromFile(page);
  template.template_data = data;
  return template;
}

