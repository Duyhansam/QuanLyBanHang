import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { apiFetch, once, findVariantId } from "./userApi";

const GUEST_KEY = "my_cart";

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) ?? [];
  } catch {
    return [];
  }
};
const saveGuest = (list) =>
  localStorage.setItem(GUEST_KEY, JSON.stringify(list));

// Khóa của một dòng trong giỏ (giữ nguyên cách tạo như trước)
const idOf = (item) =>
  item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;

const toRequest = (item) => ({
  cartItemId: idOf(item),
  productId: item.id,
  variantId: findVariantId(item),
  selectedSize: item.selectedSize || "M",
  quantity: item.quantity || 1,
});

// Dữ liệu backend -> dạng item giỏ hàng mà giao diện đang dùng
const fromServer = (row) => {
  const product = row.product;
  const variant =
    product.variants?.find((v) => v.id === row.variantId) ??
    product.variants?.[0];
  return {
    ...product,
    image: variant?.image ?? "",
    selectedColor: variant?.colorName ?? null,
    selectedSize: row.selectedSize,
    quantity: row.quantity,
    cartItemId: row.cartItemId,
  };
};

// Lần đầu sau đăng nhập: đẩy giỏ hàng của khách lên tài khoản (cộng dồn số lượng)
const syncCart = (token) =>
  once(`cart:${token}`, async () => {
    const guest = readGuest();
    if (guest.length > 0) {
      localStorage.removeItem(GUEST_KEY);
      try {
        return await apiFetch("/api/cart/merge", token, {
          method: "POST",
          body: JSON.stringify({ items: guest.map(toRequest) }),
        });
      } catch (err) {
        saveGuest(guest); // gộp thất bại thì giữ lại giỏ hàng của khách
        throw err;
      }
    }
    return apiFetch("/api/cart", token);
  });

export function useListCart() {
  const { user, logout } = useAuth();
  const token = user?.token ?? null;

  // Đã đăng nhập thì chờ dữ liệu từ server, chưa thì đọc từ localStorage
  const [cart, setCart] = useState(() => (token ? [] : readGuest()));
  const cartRef = useRef(cart);

  // Ghi state; chỉ lưu localStorage khi chưa đăng nhập
  const commit = (next) => {
    cartRef.current = next;
    setCart(next);
    if (!token) saveGuest(next);
  };

  const handleError = (err) => {
    if (err?.status === 401) {
      logout();
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    } else {
      toast.error("Không thể đồng bộ giỏ hàng với máy chủ.");
    }
  };

  const reload = () =>
    apiFetch("/api/cart", token)
      .then((rows) => commit(rows.map(fromServer)))
      .catch(handleError);

  // Gọi API (khi đã đăng nhập); lỗi thì báo và tải lại giỏ từ server
  const callServer = (path, options) => {
    if (!token) return;
    apiFetch(path, token, options).catch((err) => {
      handleError(err);
      reload();
    });
  };

  // Chạy khi đăng nhập / đăng xuất
  useEffect(() => {
    if (!token) {
      const guest = readGuest();
      cartRef.current = guest;
      setCart(guest);
      return;
    }

    let cancelled = false;
    syncCart(token)
      .then((rows) => {
        if (cancelled) return;
        const list = rows.map(fromServer);
        cartRef.current = list;
        setCart(list);
      })
      .catch((err) => {
        if (!cancelled) handleError(err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    const selectedSize = product.selectedSize || "M";
    const uniqueId = product.cartItemId || `${product.id}-${selectedSize}`;
    const quantityToAdd = product.quantity || 1;
    const prevCart = cartRef.current;

    const existingItem = prevCart.find((item) => idOf(item) === uniqueId);

    const next = existingItem
      ? prevCart.map((item) =>
          idOf(item) === uniqueId
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        )
      : [
          ...prevCart,
          {
            ...product,
            cartItemId: uniqueId,
            selectedSize,
            quantity: quantityToAdd,
          },
        ];
    commit(next);

    callServer("/api/cart", {
      method: "POST",
      body: JSON.stringify(
        toRequest({
          ...product,
          cartItemId: uniqueId,
          selectedSize,
          quantity: quantityToAdd,
        }),
      ),
    });
  };

  // Đổi số lượng của một dòng (dùng cho nút + và -)
  const changeQuantity = (cartItemId, delta) => {
    const target = cartRef.current.find((item) => idOf(item) === cartItemId);
    if (!target) return;

    const quantity = target.quantity + delta;
    if (quantity < 1) return; // tối thiểu là 1, muốn bỏ thì dùng nút xóa

    commit(
      cartRef.current.map((item) =>
        idOf(item) === cartItemId ? { ...item, quantity } : item,
      ),
    );
    callServer("/api/cart/quantity", {
      method: "PUT",
      body: JSON.stringify({ cartItemId, quantity }),
    });
  };

  const handleIncreaseQuantity = (cartItemId) => changeQuantity(cartItemId, 1);
  const handleDecreaseQuantity = (cartItemId) => changeQuantity(cartItemId, -1);

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = (cartItemId) => {
    commit(cartRef.current.filter((item) => idOf(item) !== cartItemId));
    callServer(`/api/cart/item?cartItemId=${encodeURIComponent(cartItemId)}`, {
      method: "DELETE",
    });
  };

  // Làm trống giỏ hàng sau khi đặt hàng thành công
  const handleClearCart = () => {
    commit([]);
    callServer("/api/cart", { method: "DELETE" });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    handleAddToCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveFromCart,
    handleClearCart,
    cartCount,
  };
}
