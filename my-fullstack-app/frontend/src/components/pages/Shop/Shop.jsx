import ShopHeader from "./ShopHeader";
import { ProductCard } from "../ProductCart/ProductCardBasic";
import { useFetch } from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Luôn sắp xếp trên BẢN SAO ([...list]) vì sort() sửa trực tiếp mảng gốc,
// mà props / state trong React không được sửa trực tiếp.
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

  // Chỉ hiển thị sản phẩm có id >= MIN_PRODUCT_ID (lọc ở URL gửi lên server và lọc lại phía client cho chắc).
  const MIN_PRODUCT_ID = 6;

  const url = keyword
    ? `/api/products/search?q=${encodeURIComponent(keyword)}`
    : `/api/products?minId=${MIN_PRODUCT_ID}`;

  const { data: products, loading, error } = useFetch(url);

  // Mỗi khi từ khóa tìm kiếm đổi thì về trạng thái ban đầu: chỉ hiện 8 sản phẩm và bỏ sắp xếp.
  useEffect(() => {
    setVisibleCount(8);
    setSortBy("default");
  }, [keyword]);

  if (loading) {
    return <div className="px-8 py-9">Loading products...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Failed to load data: {error}</div>
    );
  }

  const visibleSource = (products || []).filter((p) => p.id >= MIN_PRODUCT_ID);
  const sortedProducts = sortProducts(visibleSource, sortBy);
  // "Load more": chỉ cắt visibleCount sản phẩm đầu để hiển thị; mỗi lần bấm nút sẽ tăng visibleCount.
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
          {keyword ? `No products found for "${keyword}".` : "No products yet."}
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
