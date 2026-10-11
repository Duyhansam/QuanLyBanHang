import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ProductCardMen } from "../ProductCart/ProductCardGender";
import { useFetch } from "../../hooks/useFetch";

const DESCRIPTIONS = {
  boots:
    "Waterproof, warm, and with excellent traction—boots for every journey..",
  running: "Lightweight, cushioned, and flexible for every run.",
  lifestyle: "Everyday style, perfect for any occasion.",
  walking: "Comfortable for long walks every day.",
  training: "Stable and durable for all your workouts.",
  sneakers: "The most popular sneaker styles.",
  sandals: "Breathable for sunny days.",
};

const sortProducts = (list, sortBy) => {
  const copy = [...list];
  if (sortBy === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sortBy === "name")
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
};

export default function CategoryPage({
  wishlist = [],
  handleAddToWishlist,
  handleAddToCart,
}) {
  const { slug } = useParams(); // ví dụ "boots"
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(8);

  // "boots" -> "BOOTS" (khớp với cột products.type trong DB)
  const type = slug.toUpperCase().replace(/-/g, "_");
  const title = slug.replace(/-/g, " ").toUpperCase();

  const { data, loading, error } = useFetch(
    `/api/products?type=${encodeURIComponent(type)}`,
  );

  // Đổi category thì đặt lại sort và số lượng hiển thị
  useEffect(() => {
    setSortBy("default");
    setVisibleCount(8);
  }, [slug]);

  if (loading) {
    return <div className="px-8 py-9">Đang tải sản phẩm...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Lỗi tải dữ liệu: {error}</div>
    );
  }

  // Thẻ sản phẩm cần ít nhất 1 biến thể (màu) để hiện ảnh
  const products = sortProducts(
    data.filter((p) => p.variants?.length > 0),
    sortBy,
  );
  const displayed = products.slice(0, visibleCount);

  return (
    <div className="bg-white text-black min-h-screen px-8 py-9">
      <nav className="mb-4 text-xs text-gray-500">
        <Link to="/" className="hover:text-black">
          Home
        </Link>{" "}
        / <span className="text-black font-medium">{title}</span>
      </nav>

      <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold uppercase font-archivo-black">
        {title}
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded">
          {products.length}
        </span>
      </h1>

      {DESCRIPTIONS[slug] && (
        <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-600">
          {DESCRIPTIONS[slug]}
        </p>
      )}

      <div className="my-6 flex justify-end">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none cursor-pointer rounded bg-transparent py-2 pl-4 pr-8 text-xs font-bold uppercase outline-none"
          >
            <option value="default">SORT</option>
            <option value="price-asc">PRICE: LOW TO HIGH</option>
            <option value="price-desc">PRICE: HIGH TO LOW</option>
            <option value="name">NAME: A-Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
        </div>
      </div>

      {products.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          Chưa có sản phẩm nào trong mục này.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayed.map((item) => (
          <ProductCardMen
            key={item.id}
            product={item}
            isInitiallyLiked={wishlist.some((fav) => fav.id === item.id)}
            onToggleWishlist={handleAddToWishlist}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {visibleCount < products.length && (
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
