import React, { useState, useEffect } from "react";
export function useWishList() {
  // 1. Khởi tạo wishlist từ localStorage (nếu có)
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("my_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  // Tự động lưu lại vào localStorage mỗi khi wishlist thay đổi
  useEffect(() => {
    localStorage.setItem("my_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  //  Hàm xử lý Thêm / Xóa khỏi Wishlist (Toggle)
  const handleToggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        const imageToSave =
          product.image ||
          product.variants?.[0]?.image ||
          product.variants?.[0]?.thumbnail ||
          "";

        const newItem = {
          ...product,
          image: imageToSave,
        };

        return [...prevWishlist, newItem];
      }
    });
  };
  const wishlistCount = wishlist.length;

  return {
    wishlist,
    handleToggleWishlist,
    wishlistCount,
  };
}
