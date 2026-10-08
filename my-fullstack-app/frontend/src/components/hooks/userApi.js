// Gọi các API cần đăng nhập (giỏ hàng, wishlist) kèm JWT trong header

export async function apiFetch(path, token, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  // 204 No Content (hoặc body rỗng) => không có JSON để đọc
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Dùng khi React StrictMode (dev) chạy effect 2 lần: các lần gọi cùng một khóa
// sẽ dùng chung 1 request, tránh gộp giỏ hàng 2 lần làm số lượng bị nhân đôi
const inflight = new Map();

export function once(key, factory) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = Promise.resolve()
    .then(factory)
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

// Tìm id biến thể (màu) đang chọn dựa vào ảnh của sản phẩm
export function findVariantId(item) {
  const byImage = item.variants?.find((v) => v.image && v.image === item.image);
  if (byImage) return byImage.id;

  // cartItemId có dạng "<productId>-<size>-<variantId>"
  const last = String(item.cartItemId ?? "").split("-").pop();
  return /^\d+$/.test(last) ? Number(last) : null;
}
