import product from "./PRDhome.js";
import { products } from "./PRDshop.js";
import { menproducts } from "./PRDmen.js";
import { womenproducts } from "./PRDwomen.js";
import { kidproducts } from "./PRDkid.js";
import { saleproducts } from "./PRDsale.js";
export const allProducts = [
  ...(product || []),
  ...(products || []),
  ...(menproducts || []),
  ...(womenproducts || []),
  ...(kidproducts || []),
  ...(saleproducts || []),
];
