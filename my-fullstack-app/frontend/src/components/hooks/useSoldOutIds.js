import { useEffect, useState } from "react";

// Danh sách id sản phẩm đã hết sạch hàng, tải 1 lần rồi dùng chung cho mọi thẻ sản phẩm
// (cả trang chỉ gọi API 1 lần dù có hàng chục thẻ). Cache 60 giây rồi tự tải lại.
const TTL_MS = 60_000;
const EMPTY = new Set();

let cache = null;
let loadedAt = 0;
let inflight = null;
const listeners = new Set();

function load() {
  if (inflight) return inflight;
  inflight = fetch("/api/products/sold-out")
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => []) // lỗi mạng thì coi như chưa có sản phẩm nào hết hàng
    .then((ids) => {
      cache = new Set(ids);
      loadedAt = Date.now();
      listeners.forEach((setIds) => setIds(cache));
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSoldOutIds() {
  const [ids, setIds] = useState(cache ?? EMPTY);

  useEffect(() => {
    listeners.add(setIds);
    if (!cache || Date.now() - loadedAt > TTL_MS) load();
    return () => {
      listeners.delete(setIds);
    };
  }, []);

  return ids;
}
