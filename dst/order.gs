function add_order_impl(data){
    const user = IdM.get_current_user();
    const ss = user.spreadsheet();
    return IdM.add_order(ss, data);
}

function get_transfer_price(name = 'Transfer') {
  return get_config_transfer_price();
}

function get_config_transfer_price(){
  return get_config_value("Transfer price UAH/KG");
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