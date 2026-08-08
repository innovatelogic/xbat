//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function export_all()
{
  export_prom_articuls();
  export_rozetka_articuls();
  export_xbat_com_ua_articuls();
  export_rosport();
}

//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function test_export(){
  //export_prom_articuls('xbat/export/test_prom.xml');
  export_rozetka_articuls('xbat/export/test_rozetka.xml');
  //export_xbat_com_ua_articuls('xbat/export/test_xbat-com-ua.xml');
}

//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function export_prom_articuls(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/prom.xml';

  const logger = IdM.create_scoped_logger("export_prom_articuls");

  logger.log("start export");

  const nd_root = XmlService.getNamespace('g', 'http://base.google.com/ns/1.0');

  // Create elements in the namespace if needed
  const nd_shop = XmlService.createElement('shop', nd_root);

  const now = new Date();
  const formatted = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  nd_shop.setAttribute("date", formatted);

  const nd_categories = XmlService.createElement('categories', nd_root);
  const nd_offers = XmlService.createElement('offers', nd_root);
  
  // Build the document
  nd_shop.addContent(nd_categories);
  {
    const root_category = XmlService.createElement('category', nd_root)
                            .setAttribute('id', 136075826)
                            .setText("Акумутятори, елементи живлення, контроллери, аксесуари");

    nd_categories.addContent(root_category);
  }

  nd_shop.addContent(nd_offers); // add offers under shop

  const user = IdM.get_current_user();
  const items = IdM.get_all_articuls(user.sheet("Articuls_v2"));

  items.forEach(offer => {
    if (offer.export_rules == null) {
      return;
    }

    const root = XmlService.parse(offer.export_rules).getRootElement();
    const ns = root.getNamespace();

    const prom = root.getChild("Prom", ns);
    if (!prom) { return; }

    const src_offer = prom.getChild("offer", ns);
    if (!src_offer) { return; }

    if (src_offer){
      nd_offers.addContent(IdM.clone_xml_element(src_offer));
    }
  });
  
  const doc = XmlService.createDocument(nd_shop);

  // Convert to string
  const xmlString = XmlService.getPrettyFormat().format(doc);

  //console.log(xmlString);

  IdM.upload_to_s3(xmlString, filepath, getSecrets);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

  IdM.write_range(user.sheet("Dashboard"),
   [["Export", "Prom"], [IdM.get_timestamp(), logger.flush()]], 1,1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]
);
}

//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function export_rozetka_articuls(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/rozetka.xml';

  const logger = IdM.create_scoped_logger("export_rozetka_articuls");

  logger.log("start export");

  const root = XmlService.createElement("yml_catalog");

  const now = new Date();
  const daytime = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  root.setAttribute("date", daytime);

  const shop = XmlService.createElement('shop');
  root.addContent(shop);


  IdM.add_xml_node_text(shop, "name", get_shop_name());
  IdM.add_xml_node_text(shop, "company", get_company_name());
  IdM.add_xml_node_text(shop, "url", get_company_url());

  const currencies = XmlService.createElement('currencies');

  const currency_ua = XmlService.createElement('currency')
                                .setAttribute("id", "UAH")
                                .setAttribute("rate", get_currency_rate("UAH", "UAH"));
  currencies.addContent(currency_ua);

  const currency_map = get_currency();
  
  {
    const currency_usd = XmlService.createElement('currency')
                                .setAttribute("id", "USD")
                                .setAttribute("rate", get_currency_rate("UAH", "USD"));
    currencies.addContent(currency_usd);
  }
  {
    const currency_eur = XmlService.createElement('currency')
                                .setAttribute("id", "EUR")
                                .setAttribute("rate", get_currency_rate("UAH", "EUR"));
    currencies.addContent(currency_eur);
  }

  shop.addContent(currencies);

  const categories = XmlService.createElement('categories');

  const offers = XmlService.createElement('offers');
  
  {
    const root_category = XmlService.createElement('category')
                            .setAttribute('id', 654239)
                            .setText("Акумулятори та батарейки");

    categories.addContent(root_category);
  }
  shop.addContent(categories);

  const user = IdM.get_current_user();
  const items = IdM.get_all_articuls(user.sheet("Articuls_v2"));
  //const items = get_all_items_v2();

  items.forEach(offer => {
    if (offer.export_rules == null) {
      return;
    }

    const root = XmlService.parse(offer.export_rules).getRootElement();

    const prom = root.getChild("Rozetka");
    if (!prom) { return; }

    const src_offer = prom.getChild("offer");
    if (!src_offer) { return; }

    if (src_offer){
      offers.addContent(IdM.clone_xml_element(src_offer));
    }
  });

  shop.addContent(offers);

  const doc = XmlService.createDocument(root);

  // Convert to string
  const xml_string = XmlService.getPrettyFormat().format(doc);

  IdM.upload_to_s3(xml_string, filepath, getSecrets);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

  IdM.write_range(user.sheet("Dashboard"),
  [["Export", "Rozetka"], [IdM.get_timestamp(), logger.flush()]], 5, 1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]
);
}

//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function export_xbat_com_ua_articuls(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/xbat-com-ua.xml';

  const logger = IdM.create_scoped_logger("export_xbat_com_ua_articuls");

  logger.log("start export");

  const root = XmlService.createElement("yml_catalog");

  const now = new Date();
  const daytime = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  root.setAttribute("date", daytime);

  const shop = XmlService.createElement('shop');
  root.addContent(shop);


  IdM.add_xml_node_text(shop, "name", get_shop_name());
  IdM.add_xml_node_text(shop, "company", get_company_name());
  IdM.add_xml_node_text(shop, "url", get_company_url());

  const categories = XmlService.createElement('categories');

  const offers = XmlService.createElement('offers');
  
  {
    const root_category = XmlService.createElement('category')
                            .setAttribute('id', 136075826)
                            .setText("Акумутятори, елементи живлення, контроллери, аксесуари");

    categories.addContent(root_category);
  }
  shop.addContent(categories);

  const user = IdM.get_current_user();
  const items = IdM.get_all_articuls(user.sheet("Articuls_v2"));
  //const items = get_all_items_v2();
  
  items.forEach(offer => {
    if (offer.export_rules == null) {
      return;
    }

    const root = XmlService.parse(offer.export_rules).getRootElement();

    const prom = root.getChild("xbat-com-ua");
    if (!prom) { return; }

    const src_offer = prom.getChild("offer");
    if (!src_offer) { return; }

    if (src_offer){
      offers.addContent(IdM.clone_xml_element(src_offer));
    }
  });

  shop.addContent(offers);

  const doc = XmlService.createDocument(root);

  // Convert to string
  const xml_string = XmlService.getPrettyFormat().format(doc);

  IdM.upload_to_s3(xml_string, filepath, getSecrets);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

  IdM.write_range(user.sheet("Dashboard"),
  [["Export", "Xbat.com.ua"], [IdM.get_timestamp(), logger.flush()]], 9, 1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]);
}

//----------------------------------------------------------------------------------------------
// rosport export function
//----------------------------------------------------------------------------------------------
function export_rosport()
{
  const logger = IdM.create_scoped_logger("export_rosport_articuls");

  logger.log("start export");

  const source_url = "https://rosport.in.ua/products_feed.xml?hash_tag=cf62187e66846c062ad06fe2542059e6&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=25765246%2C25810144&nested_group_ids=25765246%2C25810144&extra_fields=keywords";
  const target_path = "xbat/rosport/rosport.xml";

  IdM._del_s3(target_path, getSecrets);

  download_to_s3_with_price_update(source_url, target_path, getSecrets);

  const url = 'https://idoo-public.s3.eu-central-1.amazonaws.com/' + target_path;

  const user = IdM.get_current_user();
  IdM.write_range(user.sheet("Dashboard"),
  [["Export", url], [IdM.get_timestamp(), logger.flush()]], 13, 1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]);
}

//----------------------------------------------------------------------------------------------
function download_to_s3_with_price_update(url, filename, secrets_fn) {

  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error(
      "Download failed: " + response.getResponseCode()
    );
  }


  // One copy only
  let xml = response.getContentText("UTF-8");


  xml = xml.replace(
    /(<price>)([\d.]+)(<\/price>)/g,
    function(match, open, value, close) {

      const price = Number(value);

      if (isNaN(price)) {
        return match;
      }

      const newPrice =
        Math.ceil((price * 1.15) / 5) * 5;

      return open + newPrice + close;
    }
  );


  IdM.upload_to_s3(
    xml,
    filename,
    secrets_fn
  );

  return true;
}

//----------------------------------------------------------------------------------------------
function TEST_download()
{
  const sourceUrl = "https://rosport.in.ua/products_feed.xml?hash_tag=cf62187e66846c062ad06fe2542059e6&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=25765246%2C25810144&nested_group_ids=25765246%2C25810144&extra_fields=keywords";
  const targetPath = "xbat/rosport/data.xml";
  
  IdM._del_s3(targetPath, getSecrets);

  // Pass your secrets mapping function as the final callback parameter
  IdM.download_drv3(sourceUrl, targetPath, getSecrets);
}

function TEST_download_upd()
{
  const sourceUrl = "https://rosport.in.ua/products_feed.xml?hash_tag=cf62187e66846c062ad06fe2542059e6&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=25765246%2C25810144&nested_group_ids=25765246%2C25810144&extra_fields=keywords";
  const targetPath = "xbat/rosport/rosport.xml";

  IdM._del_s3(targetPath, getSecrets);

  download_to_s3_with_price_update(sourceUrl, targetPath, getSecrets);
}

function TEST_download_streamed()
{
  const sourceUrl = "https://rosport.in.ua/products_feed.xml?hash_tag=cf62187e66846c062ad06fe2542059e6&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=25765246%2C25810144&nested_group_ids=25765246%2C25810144&extra_fields=keywords";
  const targetPath = "xbat/rosport/streamed.xml";
  
  IdM._del_s3(targetPath, getSecrets);

  // Pass your secrets mapping function as the final callback parameter
  IdM.download_to_s3_stream(sourceUrl, targetPath, getSecrets);
}

function TEST_GetItems()
{
  const user = IdM.get_current_user();
  const items = IdM.get_all_articuls(user.sheet("Articuls_v2")); 
  console.log(`${JSON.stringify(items, null, 2)}`);
}








