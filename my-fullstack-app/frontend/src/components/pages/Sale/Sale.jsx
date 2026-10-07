import { useState } from "react";
import { ProductCardSale } from "../ProductCart/ProductCardBasic";
import { useFetch } from "../../hooks/useFetch";
import SaleHeader from "./SaleHeader";

const sortProducts = (list, sortBy) => {
  const copy = [...list];
  if (sortBy === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sortBy === "discount")
    return copy.sort(
      (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
    );
  if (sortBy === "name")
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
};

export default function Sale({
  wishlist = [],
  handleAddToWishlist,
  handleAddToCart,
}) {
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState("default");

  const { data: saleproducts, loading, error } = useFetch("/api/products/sale");

  if (loading) {
    return <div className="px-8 py-9">Đang tải sản phẩm...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Lỗi tải dữ liệu: {error}</div>
    );
  }

  const sortedProducts = sortProducts(saleproducts, sortBy);
  const displayedProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="bg-white text-black min-h-screen px-8 py-9">
      <SaleHeader
        count={sortedProducts.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {sortedProducts.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          Hiện chưa có sản phẩm giảm giá.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.map((item) => {
          const isLiked = Array.isArray(wishlist)
            ? wishlist.some((fav) => fav.id === item.id)
            : false;

          return (
            <ProductCardSale
              key={item.id}
              product={item}
              isInitiallyLiked={isLiked}
              onToggleWishlist={handleAddToWishlist}
              onAddToCart={handleAddToCart}
            />
          );
        })}
      </div>

      {visibleCount < sortedProducts.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="bg-[#222] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-black transition-colors cursor-pointer shadow-sm"
          >
            LOAD MORE ITEMS
          </button>
        </div>
      )}
    </div>
  );
}
