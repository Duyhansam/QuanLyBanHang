import { Heart, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

export default function BestSeller({
  wishlist,
  onToggleWishlist,
  onAddToCart,
}) {
  const {
    data: bestSellers,
    loading,
    error,
  } = useFetch("/api/products?category=BESTSELLER");

  const getImage = (product) => product.variants?.[0]?.image ?? "";

  return (
    <section className="mx-16 mt-12 flex flex-col gap-6">
      <div className="flex justify-between items-center ">
        <h3 className="text-xs font-bold tracking-wider text-black">
          BEST SELLERS
        </h3>
        <span className="text-xs text-black font-bold cursor-pointer hover:underline">
          View all
        </span>
      </div>

      {loading && <p className="text-sm text-gray-500">Đang tải sản phẩm...</p>}
      {error && (
        <p className="text-sm text-red-500">Lỗi tải dữ liệu: {error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {bestSellers.map((product) => {
          const image = getImage(product);
          const isLiked = wishlist
            ? wishlist.some((fav) => fav.id === product.id)
            : false;

          return (
            <div
              key={product.id}
              className="bg-gray-50 rounded-2xl p-4 border border-neutral-200 flex flex-col justify-between group hover:border-black transition"
            >
              {/* Phần Ảnh & Nút Wishlist */}
              <div className="relative w-full h-48 flex items-center justify-center mb-4 overflow-hidden">
                <button
                  onClick={() =>
                    onToggleWishlist &&
                    onToggleWishlist({ ...product, image }, !isLiked)
                  }
                  className="absolute z-10 top-2 right-2 p-2 bg-white rounded-full shadow-sm transition cursor-pointer"
                  title="Yêu thích"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 hover:text-black"
                    }`}
                  />
                </button>

                <Link
                  to={`/product/${product.id}`}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </Link>
              </div>

              {/* Phần Thông tin sản phẩm */}
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <Link to={`/product/${product.id}`}>
                    <span className="text-sm font-bold text-neutral-900 truncate block cursor-pointer hover:underline">
                      {product.name}
                    </span>
                  </Link>
                  <span className="text-xs text-neutral-500 mt-0.5 block">
                    {product.brand?.name}
                  </span>
                </div>

                {/* Phần Giá & Nút Add to Cart */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-black">
                    ${product.price}
                  </span>

                  <button
                    onClick={() =>
                      onAddToCart && onAddToCart({ ...product, image })
                    }
                    className="p-2 bg-black text-white rounded-full hover:bg-neutral-800 transition cursor-pointer shadow-sm"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Phần Đánh giá Sao */}
                <div className="flex items-center gap-1 text-xs text-neutral-600 mt-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{product.rating}</span>
                  <span className="text-neutral-400">{product.reviews}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
