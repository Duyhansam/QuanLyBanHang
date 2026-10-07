import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // 1. Import toast

export default function ProductOptions({
  product,
  selectedVariant,
  selectedSize,
  onSelectSize,
  quantity,
  onQuantityChange,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}) {
  const navigate = useNavigate();

  // Tạo hàm gom nhóm dữ liệu sản phẩm đưa vào giỏ hàng
  const handleCreateCartItem = () => {
    return {
      ...product,
      cartItemId: `${product.id}-${selectedSize || "M"}-${
        selectedVariant
          ? selectedVariant.colorName || selectedVariant.id
          : "default"
      }`,
      selectedSize: selectedSize || "M",
      quantity: quantity,
      image:
        selectedVariant && selectedVariant.image
          ? selectedVariant.image
          : product.image,
      selectedColor: selectedVariant ? selectedVariant.colorName : null,
    };
  };

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      const itemToCart = handleCreateCartItem();
      onAddToCart(itemToCart);
      toast.success("Product added to cart!");
    }
  };

  const handleBuyNowClick = () => {
    const itemToBuyNow = handleCreateCartItem();

    navigate("/checkout", { state: { buyNowItem: itemToBuyNow } });
  };

  const handleWishlistClick = () => {
    if (onToggleWishlist) {
      const nextState = !isWishlisted;
      onToggleWishlist(product, nextState);

      // 3. Thông báo linh hoạt theo trạng thái Thêm / Xóa Wishlist
      if (nextState) {
        toast.success("Product added to wishlist.!");
      } else {
        toast("Product removed from wishlist.!", { icon: "💔" });
      }
    }
  };

  return (
    <div>
      {/* Chọn Kích cỡ (Size) */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase text-black mb-2">
          SIZE:
        </label>
        <div className="flex items-center gap-2">
          {(product.sizes || ["S", "M", "L", "XL"]).map((size) => (
            <button
              key={size}
              onClick={() => onSelectSize(size)}
              className={`w-12 h-10 border text-xs font-bold transition-all cursor-pointer rounded ${
                selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn số lượng, Nút Giỏ hàng, Mua ngay & Wishlist */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-4">
          {/* Bộ tăng giảm số lượng */}
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-bold"
            >
              -
            </button>
            <span className="w-10 text-center text-sm font-bold">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-bold"
            >
              +
            </button>
          </div>

          {/* Nút Yêu thích (Wishlist) */}
          <button
            onClick={handleWishlistClick}
            className="p-4 border border-gray-300 rounded hover:border-black transition-colors cursor-pointer"
            title="Thêm vào yêu thích"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? "text-red-500 fill-red-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>

        {/* Cụm 2 nút hành động: Thêm vào giỏ & Mua ngay */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nút Thêm vào giỏ hàng */}
          <button
            onClick={handleAddToCartClick}
            className="border border-black text-black text-xs font-bold uppercase tracking-wider py-4 px-4 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to cart
          </button>

          {/* Nút Mua ngay (Buy Now) */}
          <button
            onClick={handleBuyNowClick}
            className="bg-black text-white text-xs font-bold uppercase tracking-wider py-4 px-4 rounded hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4 fill-white" />
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
}
