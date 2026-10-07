const fs = require("fs");
const path = require("path");

const DATA_DIR = "./src/data";
const OUT_FILE = "./2-products.sql";

// tên mảng trong file JS -> nhóm
const NAMES = {
  products: "AUTO",
  menproducts: "MEN",
  womenproducts: "WOMEN",
  kidproducts: "KID",
  saleproducts: "SALE",
  bestSeller: "BEST",
};
const BRANDS = [
  ["AIR JORDAN", "nike"],
  ["NIKE", "nike"],
  ["ADIDAS", "adidas"],
  ["NEW BALANCE", "new-balance"],
  ["CONVERSE", "converse"],
  ["VANS", "vans"],
  ["PUMA", "puma"],
];

const clean = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
const q = (v) =>
  v === null || v === undefined || v === ""
    ? "NULL"
    : typeof v === "number"
      ? String(v)
      : "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
const img = (s) =>
  s ? `/images/products/${s.replace(/^imageproducts\//, "shopimg/")}` : null;
const brandOf = (name) => {
  const n = name.toUpperCase();
  const b = BRANDS.find(([k]) => n.includes(k));
  return b ? `(SELECT id FROM brands WHERE slug='${b[1]}')` : "NULL";
};
const categoryOf = (key, p) => {
  if (["MEN", "WOMEN", "KID"].includes(key)) return key;
  if (key === "AUTO") return "SHOP";
  if (key === "SALE") return clean(p.category).toUpperCase();
  return "BESTSELLER";
};

// Đọc file JS, thay các import ảnh bằng đường dẫn chuỗi
function load(src, name) {
  const imgs = {};
  for (const m of src.matchAll(
    /import\s+(\w+)\s+from\s+["']\.\.\/assets\/([^"']+)["']/g,
  ))
    imgs[m[1]] = m[2];
  const body = src
    .replace(/^\s*import[^;]*;/gm, "")
    .replace(/export\s+default\s+\w+\s*;?/g, "")
    .replace(/export\s+const/g, "const");
  return new Function(...Object.keys(imgs), `${body}\nreturn ${name};`)(
    ...Object.values(imgs),
  );
}

const productRows = [],
  variantRows = [];
const seenIds = new Set(),
  seenNames = new Map();
let variantId = 1;

const files = fs
  .readdirSync(DATA_DIR)
  .filter(
    (f) => f.endsWith(".js") && !["allProduct.js", "PRDbrands.js"].includes(f),
  );

for (const file of files) {
  const src = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  for (const [name, key] of Object.entries(NAMES)) {
    if (!new RegExp(`const\\s+${name}\\s*=\\s*\\[`).test(src)) continue;
    console.log(`Đọc ${name} trong ${file}`);

    for (const p of load(src, name)) {
      if (seenIds.has(p.id)) {
        console.warn(`⚠ Trùng id ${p.id}, bỏ qua`);
        continue;
      }
      seenIds.add(p.id);

      const pname = clean(p.name);
      const lower = pname.toLowerCase();
      if (seenNames.has(lower))
        console.warn(
          `⚠ Trùng tên "${pname}": id ${seenNames.get(lower)} và id ${p.id}`,
        );
      seenNames.set(lower, p.id);

      const cols = [
        p.id,
        q(pname),
        p.price,
        q(p.originalprice ?? null),
        q(p.discountPercent ? parseInt(p.discountPercent) : null),
        q(clean(p.badge).toUpperCase()),
        q(clean(p.description)),
        q(categoryOf(key, p)),
        q(clean(p.color)),
        q(p.rating ? Number(p.rating) : null),
        q(p.reviews ?? null),
      ];
      productRows.push(`(${cols.join(", ")}, ${brandOf(pname)})`);

      const variants = p.variants ?? (p.image ? [{ image: p.image }] : []);
      for (const v of variants) {
        variantRows.push(
          `(${variantId++}, ${p.id}, ${q(clean(v.colorName) || clean(p.color))}, ` +
            `${q(img(v.image))}, ${q(img(v.thumbnail ?? v.image))})`,
        );
      }
    }
  }
}

fs.writeFileSync(
  OUT_FILE,
  `INSERT IGNORE INTO products (id, name, price, original_price, discount_percent, badge, description, category, color, rating, reviews, brand_id) VALUES
${productRows.join(",\n")};

INSERT IGNORE INTO product_variants (id, product_id, color_name, image, thumbnail) VALUES
${variantRows.join(",\n")};
`,
);
console.log(
  `Xong: ${productRows.length} sản phẩm, ${variantRows.length} biến thể -> ${OUT_FILE}`,
);
