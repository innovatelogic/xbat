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
  export_prom_articuls_old(arg);
  export_prom_articuls_new(arg);
}

//----------------------------------------------------------------------------------------------
function export_prom_articuls_old(arg)
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
function export_rozetka_articuls(arg)
{
  export_rozetka_articuls_old(arg);
  export_rozetka_articuls_new(arg)
}

//----------------------------------------------------------------------------------------------
function export_rozetka_articuls_old(arg)
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
    const category_654239 = XmlService.createElement('category')
                            .setAttribute('id', 654239)
                            .setText("Акумулятори та батарейки");

    const category_1554082 = XmlService.createElement('category')
                        .setAttribute('id', 1554082)
                        .setText("Акумулятори та аксесуари для ДБЖ");

    categories.addContent(category_654239);
    categories.addContent(category_1554082);
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
  export_xbat_com_ua_articuls_old(arg);
  export_xbat_com_ua_articuls_new(arg)
}

//----------------------------------------------------------------------------------------------
function export_xbat_com_ua_articuls_old(arg)
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
  _export_rosport(1.15, "xbat/rosport/rosport_15.xml");
  _export_rosport(1.2, "xbat/rosport/rosport_20.xml");
}

//----------------------------------------------------------------------------------------------
// AWS Signature Version 4
//----------------------------------------------------------------------------------------------
function aws_sign_request(method, requestUrl, payload, service)
{
  const {
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    AWS_REGION
  } = getSecrets();

  const host = requestUrl
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .toLowerCase();

  const canonicalUri = "/";
  const canonicalQueryString = "";

  const now = new Date();

  const amzDate = Utilities.formatDate(
    now,
    "GMT",
    "yyyyMMdd'T'HHmmss'Z'"
  );

  const dateStamp = Utilities.formatDate(
    now,
    "GMT",
    "yyyyMMdd"
  );

  const payloadHash = aws_sha256_hex(payload);

  const canonicalHeaders =
    "host:" + host + "\n" +
    "x-amz-date:" + amzDate + "\n";

  const signedHeaders =
    "host;x-amz-date";

  const canonicalRequest =
    method + "\n" +
    canonicalUri + "\n" +
    canonicalQueryString + "\n" +
    canonicalHeaders + "\n" +
    signedHeaders + "\n" +
    payloadHash;

  const credentialScope =
    dateStamp + "/" +
    AWS_REGION + "/" +
    service + "/aws4_request";

  const stringToSign =
    "AWS4-HMAC-SHA256\n" +
    amzDate + "\n" +
    credentialScope + "\n" +
    aws_sha256_hex(canonicalRequest);

  const signingKey = aws_get_signature_key(
    AWS_SECRET_KEY,
    dateStamp,
    AWS_REGION,
    service
  );

  const signature = aws_bytes_to_hex(
    aws_hmac_sha256(
      signingKey,
      stringToSign
    )
  );

  const authorization =
    "AWS4-HMAC-SHA256 " +
    "Credential=" + AWS_ACCESS_KEY + "/" + credentialScope + ", " +
    "SignedHeaders=" + signedHeaders + ", " +
    "Signature=" + signature;

  return {
    "X-Amz-Date": amzDate,
    "Authorization": authorization
  };
}

//----------------------------------------------------------------------------------------------
// SHA256 → hexadecimal
//----------------------------------------------------------------------------------------------
function aws_sha256_hex(value)
{
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );

  return aws_bytes_to_hex(digest);
}


function aws_hmac_sha256(key, value)
{
  // Key must be raw bytes.
  // Initial SigV4 key is a string, so convert it to UTF-8 bytes.
  const keyBytes = Array.isArray(key)
    ? key
    : Utilities.newBlob(key).getBytes();

  // Value must also be raw bytes.
  const valueBytes = Array.isArray(value)
    ? value
    : Utilities.newBlob(value).getBytes();

  return Utilities.computeHmacSha256Signature(
    valueBytes,
    keyBytes
  );
}


function aws_get_signature_key(
  secretKey,
  dateStamp,
  regionName,
  serviceName
)
{
  const kDate = aws_hmac_sha256(
    "AWS4" + secretKey,
    dateStamp
  );

  const kRegion = aws_hmac_sha256(
    kDate,
    regionName
  );

  const kService = aws_hmac_sha256(
    kRegion,
    serviceName
  );

  const kSigning = aws_hmac_sha256(
    kService,
    "aws4_request"
  );

  return kSigning;
}


//----------------------------------------------------------------------------------------------
// Bytes → hexadecimal
//----------------------------------------------------------------------------------------------
function aws_bytes_to_hex(bytes)
{
  return bytes
    .map(function(byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ("0" + value.toString(16)).slice(-2);
    })
    .join("");
}

function _export_rosport(price_mult, file)
{
  const lambdaUrl = "https://nxnjojze253hw2vowgnzeobmpu0yuqei.lambda-url.eu-central-1.on.aws/";

  const _payload = JSON.stringify({
    price_mult: price_mult,
    output_file: file
  });

  payload = _payload

  const headers = aws_sign_request(
    "POST",
    lambdaUrl,
    payload,
    "lambda"
  );

  headers["Content-Type"] = "application/json";

  const response = UrlFetchApp.fetch(lambdaUrl, {
    method: "post",
    headers: headers,
    payload: payload,
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  console.log("HTTP status: " + code);
  console.log(body);

  if (code !== 200) {
    throw new Error("Lambda failed: " + body);
  }

  const result = JSON.parse(body);

  const user = IdM.get_current_user();

  IdM.write_range(
    user.sheet("Dashboard"),
    [
      [
        "Export",
        "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/rosport/rosport.xml"
      ],
      [
        IdM.get_timestamp(),
        result
      ]
    ],
    13,
    1,
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
function export_rozetka_articuls_new(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/rozetka_new.xml';

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
    const category_654239 = XmlService.createElement('category')
                            .setAttribute('id', 654239)
                            .setText("Акумулятори та батарейки");

    const category_1554082 = XmlService.createElement('category')
                        .setAttribute('id', 1554082)
                        .setText("Акумулятори та аксесуари для ДБЖ");

    categories.addContent(category_654239);
    categories.addContent(category_1554082);
  }
  shop.addContent(categories);

  const user = IdM.get_current_user();
  const sh = user.sheet("Articuls_v2");
  const headers = IdM.get_table_header_map_sheet(sh);

  const idx_export_rules = headers["Export Rules"];

  const items = build_items();

  items.forEach(item => {
    const ctx = item.context;
    const art = item.articul;

    const export_rules_str = item.articul[idx_export_rules];

    if (export_rules_str == null) {
      return;
    }

    const result = xflow.process_xml_engine(export_rules_str, ctx);
    const res_root = XmlService.parse(result.cleanXml).getRootElement();

    const res_shop_xml = res_root.getChild("Rozetka");
    if (!res_shop_xml){
      return;
    }

    const res_offer_xml = res_shop_xml.getChild("offer");
    if (!res_offer_xml){
      return;
    }

    offers.addContent(IdM.clone_xml_element(res_offer_xml));
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
function export_xbat_com_ua_articuls_new(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/xbat-com-ua_new.xml';

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
  const sh = user.sheet("Articuls_v2");
  const headers = IdM.get_table_header_map_sheet(sh);
  const idx_export_rules = headers["Export Rules"];

  const items = build_items();
  
  items.forEach(item => {
    const ctx = item.context;
    const art = item.articul;

    const export_rules_str = item.articul[idx_export_rules];

    if (export_rules_str == null) {
      return;
    }

    const result = xflow.process_xml_engine(export_rules_str, ctx);
    const res_root = XmlService.parse(result.cleanXml).getRootElement();
    
    const res_shop_xml = res_root.getChild("xbat-com-ua");
    if (!res_shop_xml){
      return;
    }

    const res_offer_xml = res_shop_xml.getChild("offer");
    if (!res_offer_xml){
      return;
    }

    offers.addContent(IdM.clone_xml_element(res_offer_xml));
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
function export_prom_articuls_new(arg)
{
  const filepath = (typeof arg === 'string') ? arg : 'xbat/export/prom_new.xml';

  const logger = IdM.create_scoped_logger("export_prom_articuls");

  logger.log("start export");

  const nd_root = XmlService.getNamespace('g', 'http://base.google.com/ns/1.0');

  // Create elements in the namespace if needed
  const nd_shop = XmlService.createElement('shop', nd_root);

  const now = new Date();
  const formatted = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  nd_shop.setAttribute("date", formatted);

  const nd_categories = XmlService.createElement('categories', nd_root);
  const offers = XmlService.createElement('offers', nd_root);
  
  // Build the document
  nd_shop.addContent(nd_categories);
  {
    const root_category = XmlService.createElement('category', nd_root)
                            .setAttribute('id', 136075826)
                            .setText("Акумутятори, елементи живлення, контроллери, аксесуари");

    nd_categories.addContent(root_category);
  }

  nd_shop.addContent(offers); // add offers under shop

  const user = IdM.get_current_user();
  const sh = user.sheet("Articuls_v2");
  const headers = IdM.get_table_header_map_sheet(sh);
  const idx_export_rules = headers["Export Rules"];

  const items = build_items();
  
  items.forEach(item => {
    const ctx = item.context;
    const art = item.articul;

    const export_rules_str = item.articul[idx_export_rules];

    if (export_rules_str == null) {
      return;
    }

    const result = xflow.process_xml_engine(export_rules_str, ctx);
    const res_root = XmlService.parse(result.cleanXml).getRootElement();

    const ns = res_root.getNamespace();

    const prom = res_root.getChild("Prom", ns);
    if (!prom) { return; }

    const src_offer = prom.getChild("offer", ns);
    if (!src_offer) { return; }

    offers.addContent(IdM.clone_xml_element(src_offer));
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


