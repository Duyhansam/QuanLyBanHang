import { useState, useEffect } from "react";
export function useListCart() {
  // Khởi tạo cart từ localStorage (nếu có)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("my_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Tự động lưu lại vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    localStorage.setItem("my_cart", JSON.stringify(cart));
  }, [cart]);

  // Hàm xử lý Thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      // Ưu tiên lấy cartItemId nếu đã có sẵn từ ProductCard, nếu không thì tự tạo
      const selectedSize = product.selectedSize || "M";
      const uniqueId = product.cartItemId || `${product.id}-${selectedSize}`;

      // Tìm xem trong giỏ hàng đã có sản phẩm này VÀ cùng biến thể này chưa
      const existingItem = prevCart.find(
        (item) =>
          (item.cartItemId || `${item.id}-${item.selectedSize || "M"}`) ===
          uniqueId,
      );

      const quantityToAdd = product.quantity || 1;

      if (existingItem) {
        return prevCart.map((item) => {
          const itemId =
            item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;
          return itemId === uniqueId
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item;
        });
      } else {
        return [
          ...prevCart,
          {
            ...product,
            cartItemId: uniqueId,
            selectedSize: selectedSize,
            quantity: quantityToAdd,
          },
        ];
      }
    });
  };
  // Tăng số lượng sản phẩm trong giỏ
  const handleIncreaseQuantity = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId =
          item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;
        return itemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      }),
    );
  };
  // Giảm số lượng sản phẩm trong giỏ (nếu về 0 có thể giữ nguyên hoặc xóa tùy ý, ở đây chặn tối thiểu là 1)
  const handleDecreaseQuantity = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId =
          item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;
        if (itemId === cartItemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }),
    );
  };
  // Xóa sản phẩm khỏi giỏ hàng dựa vào id
  const handleRemoveFromCart = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const currentItemId =
          item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;
        return currentItemId !== cartItemId;
      }),
    );
  };

  // Hàm làm trống giỏ hàng sau khi đặt hàng thành công
  const handleClearCart = () => {
    setCart([]);
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
