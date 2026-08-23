function buildSalesChart(days) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName('Orders_v2');
  const report = ss.getSheetByName('Charts') || ss.insertSheet('Charts');

  if (!source) throw new Error('Sheet "Orders_v2" not found');

  days = Number(days || report.getRange('B1').getValue() || 30);
  days = Math.max(1, Math.floor(days));

  // Remove old charts.
  for (const chart of report.getCharts()) report.removeChart(chart);

  // Clear old content and checkbox validation.
  report.clear();
  report.getDataRange().clearDataValidations();

  // ==================================================
  // DAYS CONTROL
  // ==================================================

  report.getRange('A1:C1').setValues([
    ['Last N days', days, '🔄 REDRAW']
  ]);

  report.getRange('A1')
    .setFontWeight('bold')
    .setBackground('#eeeeee');

  report.getRange('B1')
    .setNumberFormat('0')
    .setBackground('#fff2cc')
    .setHorizontalAlignment('center');

  report.getRange('C1')
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  report.setColumnWidth(1, 70);
  report.setColumnWidth(2, 90);
  report.setColumnWidth(3, 110);

  // ==================================================
  // READ SALES DATA
  // ==================================================

  const data = readSalesData_(source, days);

  createSelector_(report, data.articulList, data.products);

  refreshSalesChart();
}


// ==================================================
// READ / AGGREGATE SALES
// ==================================================

function readSalesData_(source, days) {

  const values = source.getDataRange().getValues();

  if (values.length < 2) throw new Error('No orders');

  const headers = values[0];

  const dateCol = headers.indexOf('Date');
  const articulCol = headers.indexOf('Артикул');
  const productNameCol = headers.indexOf('Назва продукту');
  const qtyCol = headers.indexOf('Кількість');

  if (dateCol < 0) throw new Error('Column "Date" not found');
  if (articulCol < 0) throw new Error('Column "Артикул" not found');
  if (productNameCol < 0) throw new Error('Column "Назва продукту" not found');
  if (qtyCol < 0) throw new Error('Column "Кількість" not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDate = new Date(today);
  firstDate.setDate(firstDate.getDate() - days + 1);

  const sales = {};
  const products = new Map();

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    if (!row[dateCol] || !row[articulCol]) continue;

    const date = new Date(row[dateCol]);

    if (isNaN(date.getTime())) continue;

    const quantity = Number(row[qtyCol]);

    if (!Number.isFinite(quantity)) continue;

    date.setHours(0, 0, 0, 0);

    if (date < firstDate || date > today) continue;

    const dateKey = Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

    const articul = String(row[articulCol]).trim();
    const name = String(row[productNameCol] || '').trim();

    if (!products.has(articul)) {
      products.set(articul, name);
    }

    if (!sales[dateKey]) sales[dateKey] = {};

    sales[dateKey][articul] =
      (sales[dateKey][articul] || 0) + quantity;
  }

  const articulList = [...products.keys()].sort();

  if (!articulList.length) {
    throw new Error(`No sales found for the last ${days} days`);
  }

  return {
    sales,
    products,
    articulList,
    firstDate
  };
}


// ==================================================
// CREATE PRODUCT SELECTOR
// ==================================================

function createSelector_(report, articulList, products) {

  report.getRange('A3:C3').setValues([
    ['Show', 'Артикул', 'Назва продукту']
  ]);

  report.getRange('A3:C3')
    .setFontWeight('bold')
    .setBackground('#eeeeee');

  const rows = articulList.map(articul => [
    true,
    articul,
    products.get(articul) || ''
  ]);

  if (rows.length) {

    report
      .getRange(4, 1, rows.length, 3)
      .setValues(rows);

    // Create checkboxes only here.
    report
      .getRange(4, 1, rows.length, 1)
      .insertCheckboxes();
  }

  report.setColumnWidth(1, 70);
  report.setColumnWidth(2, 150);
  report.setColumnWidth(3, 300);

  report.setFrozenRows(3);
}


// ==================================================
// REFRESH CHART
//
// IMPORTANT:
// This function does NOT recreate checkboxes.
// ==================================================

function refreshSalesChart() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName('Orders_v2');
  const report = ss.getSheetByName('Charts');

  if (!source || !report) return;

  let days = Number(report.getRange('B1').getValue());

  if (!Number.isFinite(days) || days < 1) {
    days = 30;
    report.getRange('B1').setValue(days);
  }

  days = Math.floor(days);

  // ==================================================
  // READ CURRENT CHECKBOXES
  // ==================================================

  const selectorCount = Math.max(0, report.getLastRow() - 3);

  const selectorRows = selectorCount
    ? report.getRange(4, 1, selectorCount, 3).getValues()
    : [];

  const selected = new Set();

  for (const row of selectorRows) {

    const checked = row[0] === true;
    const articul = String(row[1] || '').trim();

    if (checked && articul) {
      selected.add(articul);
    }
  }

  // ==================================================
  // READ SALES
  // ==================================================

  const data = readSalesData_(source, days);

  const sales = data.sales;
  const products = data.products;
  const articulList = data.articulList;
  const firstDate = data.firstDate;

  // ==================================================
  // SELECTED PRODUCTS
  // ==================================================

  const activeArticuls = articulList.filter(
    articul => selected.has(articul)
  );

  const getLabel = articul => {

    const name = products.get(articul) || '';

    return name
      ? `${articul} - ${name}`
      : articul;
  };

  const allLabels = articulList.map(getLabel);
  const activeLabels = activeArticuls.map(getLabel);

  // ==================================================
  // REMOVE OLD CHARTS
  // ==================================================

  for (const chart of report.getCharts()) {
    report.removeChart(chart);
  }

  // ==================================================
  // DAILY TABLE
  //
  // Starts below selector.
  //
  // A = Day
  // B = Articul 1
  // C = Articul 2
  // ...
  // ==================================================

  const dailyStartRow = articulList.length + 6;

  const dailyResult = [
    ['Day', ...allLabels]
  ];

  for (let i = 0; i < days; i++) {

    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() + i);

    const dateKey = Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

    dailyResult.push([
      date,
      ...articulList.map(
        articul => sales[dateKey]?.[articul] || 0
      )
    ]);
  }

  // ==================================================
  // CLEAR OLD DAILY TABLE
  // ==================================================

  const rowsToClear = report.getMaxRows() - dailyStartRow + 1;

  if (rowsToClear > 0) {

    report
      .getRange(
        dailyStartRow,
        1,
        rowsToClear,
        report.getMaxColumns()
      )
      .clearContent();
  }

  // ==================================================
  // WRITE DAILY TABLE
  // ==================================================

  report
    .getRange(
      dailyStartRow,
      1,
      dailyResult.length,
      dailyResult[0].length
    )
    .setValues(dailyResult);

  report
    .getRange(
      dailyStartRow + 1,
      1,
      dailyResult.length - 1,
      1
    )
    .setNumberFormat('yyyy-mm-dd');

  report
    .getRange(
      dailyStartRow,
      1,
      1,
      dailyResult[0].length
    )
    .setFontWeight('bold')
    .setBackground('#eeeeee');

  report.autoResizeColumns(
    1,
    dailyResult[0].length
  );

  // ==================================================
  // DAILY_SALES SHEET
  // ==================================================

  let daily = ss.getSheetByName('Daily_Sales');

  if (!daily) {
    daily = ss.insertSheet('Daily_Sales');
  }

  daily.clear();

  daily
    .getRange(
      1,
      1,
      dailyResult.length,
      dailyResult[0].length
    )
    .setValues(dailyResult);

  daily
    .getRange(
      2,
      1,
      dailyResult.length - 1,
      1
    )
    .setNumberFormat('yyyy-mm-dd');

  daily
    .getRange(
      1,
      1,
      1,
      dailyResult[0].length
    )
    .setFontWeight('bold')
    .setBackground('#eeeeee');

  daily.setFrozenRows(1);

  daily.autoResizeColumns(
    1,
    dailyResult[0].length
  );

  // ==================================================
  // NO PRODUCTS SELECTED
  // ==================================================

  if (!activeArticuls.length) return;

  // ==================================================
  // CHART DATA
  //
  // Put it far to the right so it does not interfere
  // with the visible selector or daily table.
  // ==================================================

  const chartDataColumn =
    Math.max(10, dailyResult[0].length + 3);

  const chartResult = [
    ['Day', ...activeLabels]
  ];

  for (let i = 0; i < days; i++) {

    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() + i);

    const dateKey = Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

    chartResult.push([
      date,
      ...activeArticuls.map(
        articul => sales[dateKey]?.[articul] || 0
      )
    ]);
  }

  // ==================================================
  // WRITE CHART DATA
  // ==================================================

  report
    .getRange(
      dailyStartRow,
      chartDataColumn,
      chartResult.length,
      chartResult[0].length
    )
    .setValues(chartResult);

  report
    .getRange(
      dailyStartRow + 1,
      chartDataColumn,
      chartResult.length - 1,
      1
    )
    .setNumberFormat('yyyy-mm-dd');

  // ==================================================
  // Y AXIS MAX
  // ==================================================

  let maxValue = 0;

  for (let r = 1; r < chartResult.length; r++) {

    for (let c = 1; c < chartResult[r].length; c++) {

      const value = Number(chartResult[r][c]);

      if (Number.isFinite(value)) {
        maxValue = Math.max(maxValue, value);
      }
    }
  }

  const yMax = maxValue > 0
    ? maxValue * 1.4
    : 1;

  // ==================================================
  // CREATE CHART
  // ==================================================

  const chart = report
    .newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(
      report.getRange(
        dailyStartRow,
        chartDataColumn,
        chartResult.length,
        chartResult[0].length
      )
    )
    .setNumHeaders(1)
    .setPosition(
      2,
      chartDataColumn + chartResult[0].length + 2,
      0,
      0
    )
    .setOption(
      'title',
      `Daily sales — last ${days} days`
    )
    .setOption('width', 1000)
    .setOption('height', 600)
    .setOption('useFirstColumnAsDomain', true)
    .setOption('hAxis', { title: 'Date' })
    .setOption(
      'vAxis',
      {
        title: 'Units sold',
        viewWindow: {
          min: 0,
          max: yMax
        }
      }
    )
    .setOption(
      'legend',
      {
        position: 'right',
        textStyle: {
          fontSize: 12,
          color: '#000000'
        }
      }
    )
    .setOption('pointSize', 4)
    .setOption('lineWidth', 2)
    .build();

  report.insertChart(chart);
}


// ==================================================
// ON EDIT
// ==================================================

function onEdit(e) {

  if (!e || !e.range) return;

  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() !== 'Charts') return;

  // ==================================================
  // B1 = NUMBER OF DAYS
  // ==================================================

  if (range.getA1Notation() === 'B1') {

    let days = Number(range.getValue());

    if (!Number.isFinite(days) || days < 1) {
      days = 30;
      range.setValue(days);
    }

    refreshSalesChart();
    return;
  }

  // ==================================================
  // C1 = REDRAW
  // ==================================================

  if (range.getA1Notation() === 'C1') {
    refreshSalesChart();
    return;
  }

  // ==================================================
  // A4:A... = PRODUCT CHECKBOXES
  // ==================================================

  if (
    range.getColumn() === 1 &&
    range.getRow() >= 4
  ) {
    refreshSalesChart();
  }
}