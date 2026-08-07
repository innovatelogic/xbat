/*function get_shop_name() { return "XBat" };
function get_company_name() { return "XBat.com.ua"; }
function get_company_url() { return "https://www.xbat.com.ua"; }*/

//----------------------------------------------------------------------------------------------
function writeRange(table_name, values, startRow, startCol, textColors, backgroundColors) {
  const default_black = "#000000";
  const default_white = "#ffffff";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(table_name);

  if (!sheet) {
    sheet = ss.insertSheet(table_name);
  }

  const numRows = values.length;
  const numCols = values[0].length;

  const range = sheet.getRange(startRow, startCol, numRows, numCols);

  range.setValues(values);

  // ---------- TEXT COLOR ----------
  if (textColors) {
    if (Array.isArray(textColors)) {
      // 2D array
      range.setFontColors(textColors);
    } else {
      // Single color → expand to matrix
      const matrix = Array.from({ length: numRows }, () =>
        Array(numCols).fill(textColors)
      );
      range.setFontColors(matrix);
    }
  } else {
    const matrix = Array.from({ length: numRows }, () =>
      Array(numCols).fill(default_black)
    );
    range.setFontColors(matrix);
  }

  // ---------- BACKGROUND ----------
  if (backgroundColors) {
    if (Array.isArray(backgroundColors)) {
      range.setBackgrounds(backgroundColors);
    } else {
      const matrix = Array.from({ length: numRows }, () =>
        Array(numCols).fill(backgroundColors)
      );
      range.setBackgrounds(matrix);
    }
  } else {
    const matrix = Array.from({ length: numRows }, () =>
      Array(numCols).fill(default_white)
    );
    range.setBackgrounds(matrix);
  }
}

