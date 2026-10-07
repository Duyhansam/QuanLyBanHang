import KidHeader from "../Kid/KidHeader";
import { ProductCardKid } from "../ProductCart/ProductCardGender";
import { useFetch } from "../../hooks/useFetch";
import { useState } from "react";

const TAB_KEYWORDS = {
  EVERYDAY: ["GOBI SNEAKER", "PRIMUS SPORT"],
  OUTDOOR: ["TRACKER", "TRAIL", "GOBI BOOT"],
  SCHOOL: ["KIDS", "JUNIORS"],
  "MINI ME": ["TODDLERS", "PRESCHOOL", "PRE-SCHOOL"],
};

const matchTab = (product, tab) => {
  if (tab === "ALL SHOES") return true;
  const name = product.name.toUpperCase();
  return TAB_KEYWORDS[tab]?.some((k) => name.includes(k)) ?? false;
};

const sortProducts = (list, sortBy) => {
  const copy = [...list];
  if (sortBy === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sortBy === "name")
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
};

export default function Kid({
  wishlist = [],
  handleAddToWishlist,
  handleAddToCart,
  cart,
}) {
  const [activeTab, setActiveTab] = useState("ALL SHOES");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(8);

  const {
    data: kidproducts,
    loading,
    error,
  } = useFetch("/api/products?category=KID");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleCount(8);
  };

  if (loading) {
    return <div className="px-8 py-9">Đang tải sản phẩm...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Lỗi tải dữ liệu: {error}</div>
    );
  }

  const filteredProducts = sortProducts(
    kidproducts.filter((p) => matchTab(p, activeTab)),
    sortBy,
  );
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="bg-white text-black min-h-screen px-8 py-9">
      <KidHeader
        count={filteredProducts.length}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {filteredProducts.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          Không có sản phẩm nào trong mục này.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {displayedProducts.map((item) => {
          const isLiked = Array.isArray(wishlist)
            ? wishlist.some((fav) => fav.id === item.id)
            : false;

          return (
            <ProductCardKid
              key={item.id}
              product={item}
              isInitiallyLiked={isLiked}
              onToggleWishlist={handleAddToWishlist}
              onAddToCart={handleAddToCart}
            />
          );
        })}
      </div>

      {visibleCount < filteredProducts.length && (
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
