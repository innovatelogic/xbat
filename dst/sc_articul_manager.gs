function show_articul_manager_form()
{
  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("articul_manager");

  const output = html.evaluate().setWidth(1400).setHeight(1000);
  SpreadsheetApp.getUi().showModalDialog(output, "Articul Manager");
}
