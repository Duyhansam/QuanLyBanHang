import { DEFAULT_SIZE, SHOE_SIZES } from "../constants/sizes";

// Chọn size để thêm nhanh vào giỏ (nút "Add to cart" ở wishlist, thẻ sản phẩm...).
// - Ưu tiên size mặc định nếu còn hàng, không thì lấy size đầu tiên còn hàng.
// - Trả về null nếu sản phẩm đã hết sạch hàng.
// - Sản phẩm chưa quản lý tồn kho, hoặc lỗi mạng: dùng size mặc định (backend vẫn kiểm tra lại khi đặt hàng).
export async function pickAvailableSize(product) {
  try {
    const res = await fetch(`/api/products/${product.id}/stock`);
    if (!res.ok) return DEFAULT_SIZE;
    const data = await res.json();
    if (!data?.tracked) return DEFAULT_SIZE;

    const inStock = (size) => (data.sizes[size] ?? 0) > 0;
    if (inStock(DEFAULT_SIZE)) return DEFAULT_SIZE;
    return (product.sizes || SHOE_SIZES).find(inStock) ?? null;
  } catch {
    return DEFAULT_SIZE;
  }
}
