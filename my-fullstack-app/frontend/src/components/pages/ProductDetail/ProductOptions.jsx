import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SHOE_SIZES, DEFAULT_SIZE } from "../../constants/sizes";
import toast from "react-hot-toast"; // 1. Import toast

export default function ProductOptions({
  product,
  selectedVariant,
  selectedSize,
  onSelectSize,
  stock, // { "36": 5, ... } hoặc null nếu không giới hạn
  quantity,
  onQuantityChange,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}) {
  const navigate = useNavigate();

  const sizes = product.sizes || SHOE_SIZES;
  const left = stock ? (stock[selectedSize] ?? 0) : null; // null = không giới hạn
  const soldOut = left !== null && left <= 0;
  const maxQty = left !== null ? Math.max(left, 1) : 99;

  // Tạo hàm gom nhóm dữ liệu sản phẩm đưa vào giỏ hàng
  const handleCreateCartItem = () => {
    return {
      ...product,
      cartItemId: `${product.id}-${selectedSize || DEFAULT_SIZE}-${selectedVariant?.id || "default"}`,
      selectedSize: selectedSize || DEFAULT_SIZE,
      quantity: quantity,
      image:
        selectedVariant && selectedVariant.image
          ? selectedVariant.image
          : product.image,
      selectedColor: selectedVariant ? selectedVariant.colorName : null,
    };
  };

  const handleAddToCartClick = () => {
    if (soldOut) {
      toast.error("This size is sold out.");
      return;
    }
    if (onAddToCart) {
      const itemToCart = handleCreateCartItem();
      onAddToCart(itemToCart);
      toast.success("Product added to cart!");
    }
  };

  const handleBuyNowClick = () => {
    if (soldOut) {
      toast.error("This size is sold out.");
      return;
    }
    const itemToBuyNow = handleCreateCartItem();

    navigate("/checkout", { state: { buyNowItem: itemToBuyNow } });
  };

  const handleWishlistClick = () => {
    if (onToggleWishlist) {
      const nextState = !isWishlisted;
      onToggleWishlist(product, nextState);

      // 3. Thông báo linh hoạt theo trạng thái Thêm / Xóa Wishlist
      if (nextState) {
        toast.success("Product added to wishlist!");
      } else {
        toast("Product removed from wishlist!", { icon: "💔" });
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
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => {
            const unavailable = stock && (stock[size] ?? 0) <= 0;
            return (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                disabled={unavailable}
                title={unavailable ? "Sold out" : undefined}
                className={`w-12 h-10 border text-xs font-bold transition-all rounded ${
                  selectedSize === size
                    ? "border-black bg-black text-white cursor-pointer"
                    : unavailable
                      ? "border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed"
                      : "border-gray-300 bg-white text-black hover:border-black cursor-pointer"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {left !== null && (
          <p
            className={`mt-2 text-xs font-semibold ${
              soldOut
                ? "text-red-600"
                : left <= 5
                  ? "text-amber-600"
                  : "text-gray-500"
            }`}
          >
            {soldOut
              ? "Out of stock"
              : left <= 5
                ? `Only ${left} left`
                : `${left} in stock`}
          </p>
        )}
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
              onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
              className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-bold"
            >
              +
            </button>
          </div>

          {/* Nút Yêu thích (Wishlist) */}
          <button
            onClick={handleWishlistClick}
            className="p-4 border border-gray-300 rounded hover:border-black transition-colors cursor-pointer"
            title="Add to wishlist"
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
            disabled={soldOut}
            className="border border-black text-black text-xs font-bold uppercase tracking-wider py-4 px-4 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to cart
          </button>

          {/* Nút Mua ngay (Buy Now) */}
          <button
            onClick={handleBuyNowClick}
            disabled={soldOut}
            className="bg-black text-white text-xs font-bold uppercase tracking-wider py-4 px-4 rounded hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 fill-white" />
            {soldOut ? "SOLD OUT" : "BUY NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}
