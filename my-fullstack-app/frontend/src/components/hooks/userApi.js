// Gọi các API cần đăng nhập (giỏ hàng, wishlist) kèm JWT trong header

export async function apiFetch(path, token, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // Đặt sau cùng để nơi gọi có thể ghi đè header mặc định khi cần
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Ưu tiên thông báo lỗi do backend trả về ({ "message": "..." })
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // không phải JSON thì giữ nguyên "HTTP <mã lỗi>"
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  // Một số API (ví dụ DELETE) trả về 204 và không có nội dung. Gọi res.json() lên body rỗng sẽ báo lỗi,
  // nên đọc dạng text trước, có nội dung mới JSON.parse.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Upload 1 ảnh (chỉ admin). Không dùng apiFetch vì phải để trình duyệt tự đặt Content-Type multipart.
export async function uploadImage(file, token) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.message || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return body.url; // ví dụ "/images/uploads/3f2c...png"
}

// once(key, factory): nếu đang có một request cùng `key` chạy dở thì dùng lại chính Promise đó thay vì gọi lần nữa.
// Cần thiết vì React StrictMode (chế độ dev) chạy useEffect 2 lần. Không có once thì giỏ hàng / wishlist của khách
// bị gộp (merge) lên server 2 lần và số lượng bị nhân đôi.
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
  // item.image là ảnh của màu đang chọn, nên so ảnh với từng variant để biết đang chọn màu nào
  const byImage = item.variants?.find((v) => v.image && v.image === item.image);
  if (byImage) return byImage.id;

  // cartItemId có dạng "<productId>-<size>-<variantId>"
  const last = String(item.cartItemId ?? "")
    .split("-")
    .pop();
  return /^\d+$/.test(last) ? Number(last) : null;
}
