import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage({
  wishlist,
  handleAddToWishlist,
  onAddToCart,
}) {
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold uppercase mb-2">Wishlist is empty</h2>
        <p className="text-gray-500 text-sm mb-8">
          You haven't saved any products to your wishlist.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-gray-800 transition-colors shadow-sm"
        >
          Explore Products Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
          Wishlist
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          You have{" "}
          <span className="font-bold text-black">{wishlist.length}</span>{" "}
          products in your wishlist
        </p>
      </div>

      {/* Lưới hiển thị sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col"
          >
            {/* Ảnh sản phẩm và nút xóa khỏi wishlist */}
            <div className="relative bg-gray-50 aspect-[3/4] overflow-hidden">
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Nút bỏ thích  */}
              <button
                onClick={() => {
                  handleAddToWishlist(product, false);
                  toast("Product removed from wishlist.!", {
                    icon: "💔",
                  });
                }}
                className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 hover:bg-white transition-colors shadow-sm cursor-pointer"
                title="Xóa khỏi yêu thích"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                  {product.category || "Fashion"}
                </span>
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black line-clamp-1 hover:text-gray-600 mb-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="text-xs font-bold text-black mb-4">
                  ${product.price?.toFixed(2)}
                </div>
              </div>

              {/* Nút thêm nhanh vào giỏ hàng */}
              <button
                onClick={() => {
                  onAddToCart({
                    ...product,
                    selectedSize: product.sizes ? product.sizes[0] : "M",
                    quantity: 1,
                  });
                  toast.success("Product added to cart!");
                }}
                className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
