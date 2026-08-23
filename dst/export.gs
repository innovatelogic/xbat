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
  _export_rosport();

  /*const lambdaUrl = "https://nxnjojze253hw2vowgnzeobmpu0yuqei.lambda-url.eu-central-1.on.aws/";

  const response = UrlFetchApp.fetch(lambdaUrl, {
    method: "post",
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
  IdM.write_range(user.sheet("Dashboard"),
  [["Export", "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/rosport/rosport.xml"], [IdM.get_timestamp(), result]], 13, 1,
  [
    ["#000000", "#000000"],
    ["#000000", "#000000"]
  ],
  [
    ["#00ff00", "#00ff00"],
    ["#00ff00", "#00ff00"]
  ]);*/
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

  const blob = response.getBlob();

  console.log("Content-Type: " + blob.getContentType());
  console.log("Downloaded bytes: " + blob.getBytes().length);

  // One copy only
  let xml = response.getContentText("UTF-8");

  console.log("XML string length: " + xml.length);

  // --------------------------------------------------
  // Check that XML was downloaded completely
  // --------------------------------------------------
  if (!xml.includes("</offers>")) {
    throw new Error(
      "Downloaded XML is truncated: </offers> not found.\n\n" +
      "Last 1000 chars:\n" +
      xml.substring(Math.max(0, xml.length - 1000))
    );
  }

  if (!xml.trim().endsWith("</yml_catalog>")) {
    throw new Error(
      "Downloaded XML is truncated: </yml_catalog> not found.\n\n" +
      "Last 1000 chars:\n" +
      xml.substring(Math.max(0, xml.length - 1000))
    );
  }


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

function _export_rosport()
{
  const lambdaUrl =
    "https://nxnjojze253hw2vowgnzeobmpu0yuqei.lambda-url.eu-central-1.on.aws/";

  const payload = "";

  const headers = aws_sign_request(
    "POST",
    lambdaUrl,
    payload,
    "lambda"
  );

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








