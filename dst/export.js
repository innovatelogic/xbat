//----------------------------------------------------------------------------------------------
// prom export function
//----------------------------------------------------------------------------------------------
function export_all()
{
  export_prom_articuls();
  export_rozetka_articuls();
  export_xbat_com_ua_articuls();
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

  const logger = new ScopedLogger("export_prom_articuls");

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

  const items = get_all_items_v2();

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
      nd_offers.addContent(cloneXmlElement(src_offer));
    }
  });
  
  const doc = XmlService.createDocument(nd_shop);

  // Convert to string
  const xmlString = XmlService.getPrettyFormat().format(doc);

  //console.log(xmlString);

  uploadToS3(xmlString, filepath);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

  writeRange(
  "Dashboard", [["Export", "Prom"], [getTimestamp(), logger.flush()]],
    1,1,
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

  const logger = new ScopedLogger("export_rozetka_articuls");

  logger.log("start export");

  const root = XmlService.createElement("yml_catalog");

  const now = new Date();
  const daytime = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  root.setAttribute("date", daytime);

  const shop = XmlService.createElement('shop');
  root.addContent(shop);


  add_xml_node_text(shop, "name", get_shop_name());
  add_xml_node_text(shop, "company", get_company_name());
  add_xml_node_text(shop, "url", get_company_url());

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

  const items = get_all_items_v2();

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
      offers.addContent(cloneXmlElement(src_offer));
    }
  });

  shop.addContent(offers);

  const doc = XmlService.createDocument(root);

  // Convert to string
  const xml_string = XmlService.getPrettyFormat().format(doc);

  uploadToS3(xml_string, filepath);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

  writeRange(
  "Dashboard", [["Export", "Rozetka"], [getTimestamp(), logger.flush()]],
    5,1,
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

  const logger = new ScopedLogger("export_xbat_com_ua_articuls");

  logger.log("start export");

  const root = XmlService.createElement("yml_catalog");

  const now = new Date();
  const daytime = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  root.setAttribute("date", daytime);

  const shop = XmlService.createElement('shop');
  root.addContent(shop);


  add_xml_node_text(shop, "name", get_shop_name());
  add_xml_node_text(shop, "company", get_company_name());
  add_xml_node_text(shop, "url", get_company_url());

  const categories = XmlService.createElement('categories');

  const offers = XmlService.createElement('offers');
  
  {
    const root_category = XmlService.createElement('category')
                            .setAttribute('id', 136075826)
                            .setText("Акумутятори, елементи живлення, контроллери, аксесуари");

    categories.addContent(root_category);
  }
  shop.addContent(categories);

  const items = get_all_items_v2();

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
      offers.addContent(cloneXmlElement(src_offer));
    }
  });

  shop.addContent(offers);

  const doc = XmlService.createDocument(root);

  // Convert to string
  const xml_string = XmlService.getPrettyFormat().format(doc);

  uploadToS3(xml_string, filepath);

  logger.log("finish export to: https://idoo-public.s3.eu-central-1.amazonaws.com/" + filepath);

    writeRange(
  "Dashboard", [["Export", "Xbat.com.ua"], [getTimestamp(), logger.flush()]],
    9,1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]);
}



