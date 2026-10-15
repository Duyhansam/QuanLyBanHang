import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { apiFetch, once, findVariantId } from "./userApi";

const GUEST_KEY = "my_wishlist";

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) ?? [];
  } catch {
    return [];
  }
};
const saveGuest = (list) =>
  localStorage.setItem(GUEST_KEY, JSON.stringify(list));

const imageOf = (product) =>
  product.image ||
  product.variants?.[0]?.image ||
  product.variants?.[0]?.thumbnail ||
  "";

const toRequest = (product) => ({
  productId: product.id,
  variantId: findVariantId(product),
});

// Dữ liệu backend -> dạng sản phẩm mà giao diện đang dùng
const fromServer = ({ product, variantId }) => {
  const variant =
    product.variants?.find((v) => v.id === variantId) ?? product.variants?.[0];
  return { ...product, image: variant?.image ?? "" };
};

// Lần đầu sau đăng nhập: đẩy wishlist của khách lên tài khoản rồi lấy danh sách mới
const syncWishlist = (token) =>
  once(`wishlist:${token}`, async () => {
    const guest = readGuest();
    if (guest.length > 0) {
      localStorage.removeItem(GUEST_KEY);
      try {
        return await apiFetch("/api/wishlist/merge", token, {
          method: "POST",
          body: JSON.stringify({ items: guest.map(toRequest) }),
        });
      } catch (err) {
        saveGuest(guest); // gộp thất bại thì giữ lại dữ liệu của khách
        throw err;
      }
    }
    return apiFetch("/api/wishlist", token);
  });

export function useWishList() {
  const { user, logout } = useAuth();
  const token = user?.token ?? null;

  // Đã đăng nhập thì chờ dữ liệu từ server, chưa thì đọc từ localStorage
  const [wishlist, setWishlist] = useState(() => (token ? [] : readGuest()));
  // Ref luôn giữ wishlist MỚI NHẤT. State `wishlist` trong closure có thể bị cũ nếu người dùng bấm liên tiếp rất nhanh
  // (React chưa kịp render lại), nên các hàm thêm / sửa / xóa đọc từ ref.current để không bị mất thao tác.
  const listRef = useRef(wishlist);

  // Ghi state; chỉ lưu localStorage khi chưa đăng nhập
  const commit = (next) => {
    listRef.current = next;
    setWishlist(next);
    if (!token) saveGuest(next);
  };

  const handleError = (err) => {
    if (err?.status === 401) {
      logout();
      toast.error("Your session has expired. Please sign in again.");
    } else {
      toast.error("Could not sync your wishlist with the server.");
    }
  };

  // Tải lại dữ liệu thật từ server. Dùng để 'hoàn tác' giao diện khi server từ chối một thao tác:
  // giao diện được cập nhật trước cho mượt (optimistic update), nếu lỗi thì quay về dữ liệu đúng của server.
  const reload = () =>
    apiFetch("/api/wishlist", token)
      .then((rows) => commit(rows.map(fromServer)))
      .catch(handleError);

  // Chạy khi đăng nhập / đăng xuất
  useEffect(() => {
    if (!token) {
      const guest = readGuest();
      listRef.current = guest;
      setWishlist(guest);
      return;
    }

    // cancelled: nếu người dùng đăng xuất / đổi tài khoản trước khi request xong thì bỏ qua kết quả cũ,
    // tránh ghi đè dữ liệu của tài khoản mới bằng dữ liệu của tài khoản cũ.
    let cancelled = false;
    syncWishlist(token)
      .then((rows) => {
        if (cancelled) return;
        const list = rows.map(fromServer);
        listRef.current = list;
        setWishlist(list);
      })
      .catch((err) => {
        if (!cancelled) handleError(err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Thêm / xóa khỏi wishlist (toggle)
  const handleToggleWishlist = (product) => {
    const current = listRef.current;
    const exists = current.some((item) => item.id === product.id);

    if (exists) {
      commit(current.filter((item) => item.id !== product.id));
      if (token) {
        apiFetch(`/api/wishlist/${product.id}`, token, {
          method: "DELETE",
        }).catch((err) => {
          handleError(err);
          reload();
        });
      }
      return;
    }

    const newItem = { ...product, image: imageOf(product) };
    commit([...current, newItem]);
    if (token) {
      apiFetch("/api/wishlist", token, {
        method: "POST",
        body: JSON.stringify(toRequest(newItem)),
      }).catch((err) => {
        handleError(err);
        reload();
      });
    }
  };

  const wishlistCount = wishlist.length;

  return {
    wishlist,
    handleToggleWishlist,
    wishlistCount,
  };
}
