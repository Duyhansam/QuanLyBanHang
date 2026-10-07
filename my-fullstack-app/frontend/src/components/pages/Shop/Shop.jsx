import ShopHeader from "./ShopHeader";
import { ProductCard } from "../ProductCart/ProductCardBasic";
import { useFetch } from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const sortProducts = (list, sortBy) => {
  const copy = [...list];
  if (sortBy === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sortBy === "name")
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
};

export default function Shop({
  wishlist = [],
  handleAddToWishlist,
  handleAddToCart,
}) {
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortBy, setSortBy] = useState("default");
  const [searchParams] = useSearchParams();
  const keyword = (searchParams.get("q") || "").trim();

  const url = keyword
    ? `/api/products/search?q=${encodeURIComponent(keyword)}`
    : "/api/products?category=SHOP";
  const { data: products, loading, error } = useFetch(url);

  useEffect(() => {
    setVisibleCount(8);
    setSortBy("default");
  }, [keyword]);

  if (loading) {
    return <div className="px-8 py-9">Đang tải sản phẩm...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Lỗi tải dữ liệu: {error}</div>
    );
  }

  const sortedProducts = sortProducts(products, sortBy);
  const displayedProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="bg-white text-black min-h-screen px-8 py-9">
      <ShopHeader
        count={sortedProducts.length}
        keyword={keyword}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {sortedProducts.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          {keyword
            ? `Không tìm thấy sản phẩm nào cho "${keyword}".`
            : "Chưa có sản phẩm nào."}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.map((item) => {
          const isLiked = wishlist.some((fav) => fav.id === item.id);

          return (
            <ProductCard
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
