
//----------------------------------------------------------------------------------------------
function TEST_PrepareCalculationInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Orders New");
  if (!sheet) {
    throw new Error("Sheet 'Orders New' not found");
  }

  const range = sheet.getRange("B2:B3");
  sheet.setActiveRange(range);
  const {new_backets, removed_orders} = PrepareCalculationInfo();

  // Convert Map to plain object
  const backetsObj = Object.fromEntries(new_backets);
  const removedOrdersArray = Array.from(removed_orders);

  // Convert to JSON
  const backets_json = JSON.stringify(backetsObj);
  const removed_orders_json = JSON.stringify(removedOrdersArray);

  // Pass JSON to HTML
  const html = HtmlService.createTemplateFromFile("calculation");
  html.data = backets_json;
  html.removed_orders = removed_orders_json;
}

//----------------------------------------------------------------------------------------------
function TEST_onCalculationConfirmed(backets_str) {
  const data = `
  {
    "0": {
      "orders": {
        "ORD-1764527899730": [
          {
            "order_id": "ORD-1764527899730",
            "row_data": {},
            "status": "Закрито",
            "total": 1120,
            "account": "Накл плат Ігор",
            "profit": 152,
            "base": 968,
            "articul": "ART-LGM58T21700-BC-BP"
          }
        ],
        "ORD-1764527983011": [
          {
            "account": "Накл плат Ігор",
            "profit": 130,
            "order_id": "ORD-1764527983011",
            "status": "Закрито",
            "base": 345,
            "row_data": {},
            "total": 475,
            "articul": "ART-18650-MolicelP26A -BC-BP"
          }
        ]
      },
      "base": 1313,
      "total": 1595,
      "accounts": [
        "Накл плат Ігор",
        "ФОП ІГОР",
        "Готівка Ігор"
      ],
      "profit": 282
    }
  }`;
  
  onCalculationConfirmed(JSON.parse(data));
}

//----------------------------------------------------------------------------------------------
function TEST_GetConfigDefaultString() {
  const user = IdM.get_current_user();
  const val = IdM.get_config_value_def(user.sheet(".config"), `sku_name`, `Non-Valid`);
  const val_def = IdM.get_config_value_def(user.sheet(".config"), `not_exist.tag_name`, `Non-Valid`);

  console.log(val);
  console.log(val_def); 
}

//----------------------------------------------------------------------------------------------
function TEST_read_config_sheet()
{
  const table_name = ".config";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(table_name);
  if (!sh) throw new Error(`[get_config_value] error: "${table_name}" not found!`);

  const uah_uah = IdM.get_currency_rate_v2(sh, "UAH", "UAH");

  if (uah_uah != 1.0) {
    throw new Error(`[TEST_read_config_sheet] get_currency_rate error: invalid rate!`);
  }

  const uah_pln_rate = IdM.get_currency_rate_v2(sh, "UAH", "PLN");

  console.log(`✅ ${IdM.get_caller_function_name()} Test passed`);
}

//----------------------------------------------------------------------------------------------
function TEST_read_config_lib()
{
  const table_name = ".config";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(table_name);
  const uah_pln_rate = IdM.get_currency_rate(sh, "UAH", "PLN");
  console.log(`✅ ${IdM.get_caller_function_name()} Test passed`);
}

//----------------------------------------------------------------------------------------------
function TEST_Add_order()
{
  const user = IdM.get_current_user();
  const sh = user.sheet();

  const testData = {
    client_info: "Test Client",
    payment: "Cash",
    notes: "Test note",
    total_price: 300,
    positions: [
      {
        offer_id: 61000,
        item_name: "Item1",
        count: 2,
        bare_price: 50,
        pos_price: 150,
        profit: 20,
        tax: 5
      },
      {
        offer_id: 61009,
        item_name: "Item2",
        count: 1,
        bare_price: 100,
        pos_price: 150,
        profit: 30,
        tax: 10
      }
    ]
  };

  //const result = add_order("Orders_v2", testData);
}

//----------------------------------------------------------------------------------------------
function runAllTests() {
  const tests = Object.keys(this)
    .filter(name => name.startsWith('TEST_'));

  let passed = 0;

  tests.forEach(name => {
    try {
      this[name]();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
    }
  });

  console.log(`\n${passed}/${tests.length} tests passed`);
}
