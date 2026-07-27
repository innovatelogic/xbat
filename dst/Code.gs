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
function show_order_sidebar() {
  const template = HtmlService.createTemplateFromFile('add_order_sidebar');
  const html = template.evaluate()
    .setTitle('Додати замовлення')
    .setWidth(1000);

  SpreadsheetApp.getUi().showSidebar(html);
}

//----------------------------------------------------------------------------------------------
function doGet(e) {

  const template = HtmlService.createTemplateFromFile('main');
  template.page = e.parameter.page || "add_order";

  return template.evaluate()
    .setTitle("Prod: XBat")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

//----------------------------------------------------------------------------------------------
function render_page(page){
  return HtmlService
    .createTemplateFromFile(page)
    .evaluate()
    .getContent();
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

function TEST_SelectRoot()
{
  const usr = IdM.get_current_user();
  IdM.request_root_spreadsheet(usr, SpreadsheetApp.getUi());
}
