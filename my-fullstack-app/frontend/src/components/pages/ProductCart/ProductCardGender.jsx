import { useState, useEffect } from "react";
import { Heart, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCompare } from "../../hooks/useCompare";

const MAX_VISIBLE = 5;

function GenderCardBase({
  product,
  onToggleWishlist,
  onAddToCart,
  isInitiallyLiked,
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyLiked || false);
  const { isInCompare, handleToggleCompare } = useCompare();
  const inCompare = isInCompare(product.id);

  const handleCompareClick = () => {
    handleToggleCompare({
      ...product,
      image: selectedVariant?.image || product.image,
    });
  };
  const [showAllVariants, setShowAllVariants] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInitiallyLiked || false);
  }, [isInitiallyLiked]);

  const handleWishlistClick = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);

    const activeImage = selectedVariant?.image || product.image;

    const productToWishlist = {
      ...product,
      image: activeImage,
    };

    // Kiểm tra trạng thái để hiển thị toast phù hợp
    if (next) {
      toast.success("Product added to wishlist.!");
    } else {
      toast("Product removed from wishlist.!", { icon: "💔" });
    }

    onToggleWishlist?.(productToWishlist, next);
  };
  // Hàm xử lý thêm vào giỏ hàng bám sát vào biến thể đang chọn
  const handleAddToCartClick = () => {
    if (onAddToCart) {
      const activeImage = selectedVariant?.image || product.image;
      const selectedSize = "M";

      const itemToCart = {
        ...product,
        image: activeImage,
        selectedSize: selectedSize,
        cartItemId: `${product.id}-${selectedSize}-${selectedVariant?.id || "default"}`,
        quantity: 1,
      };

      onAddToCart(itemToCart);
      toast.success("Product added to cart!");
    }
  };

  const visibleVariants = showAllVariants
    ? product.variants
    : product.variants.slice(0, MAX_VISIBLE);
  const remainingCount = product.variants.length - MAX_VISIBLE;
  const to = `/product/${product.id}`;

  return (
    <div className="bg-white flex flex-col justify-center">
      <div className="cursor-pointer relative bg-[#f4f4f4] aspect-[4/3] flex items-center justify-center p-4 overflow-hidden mb-3 group">
        {product.badge && (
          <span className="absolute top-3 right-3 bg-white text-black text-[9px] font-bold px-2.5 py-1 rounded border border-gray-200 uppercase tracking-wider z-10 shadow-sm">
            {product.badge}
          </span>
        )}
        <Link to={to}>
          <img
            src={selectedVariant.image}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {visibleVariants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            className={`w-12 h-12 rounded overflow-hidden border transition-all ${
              selectedVariant.id === variant.id
                ? "border-black ring-1 ring-black scale-105"
                : "border-gray-300 opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={variant.thumbnail}
              alt={variant.colorName}
              className="w-full h-full object-cover cursor-pointer"
            />
          </button>
        ))}
        {!showAllVariants && remainingCount > 0 && (
          <button
            onClick={() => setShowAllVariants(true)}
            className="text-xs font-bold text-gray-700 hover:text-black cursor-pointer underline underline-offset-4 ml-1 px-1 py-2"
          >
            +{remainingCount}
          </button>
        )}
      </div>

      <Link to={to}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-xs font-bold text-black uppercase cursor-pointer">
            {product.name}
          </h3>
          <span className="text-xs font-semibold whitespace-nowrap text-black">
            ${product.price}
          </span>
        </div>
      </Link>
      <p className="text-[11px] mb-3 line-clamp-1 text-gray-500">
        {product.description}
      </p>

      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <button
          onClick={handleCompareClick}
          className={`group flex items-center gap-1.5 uppercase font-medium cursor-pointer text-[10px] ${
            inCompare
              ? "text-black font-bold"
              : "text-gray-500 hover:text-black"
          }`}
        >
          <span className="relative flex flex-col items-center justify-center w-3 h-3.5">
            <ArrowUp className="w-3 h-3 absolute top-0 transition-transform duration-300 group-hover:-translate-y-1 text-gray-600 group-hover:text-black" />
            <ArrowDown className="w-3 h-3 absolute bottom-0 transition-transform duration-300 group-hover:translate-y-1 text-gray-600 group-hover:text-black" />
          </span>
          COMPARE
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleWishlistClick}
            className="p-1.5 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? "text-red-500 fill-red-500"
                  : "text-gray-600 hover:text-black"
              }`}
            />
          </button>
          <button
            onClick={handleAddToCartClick}
            className="p-1.5 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-gray-600 hover:text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductCardWomen = (props) => <GenderCardBase {...props} />;
export const ProductCardMen = (props) => <GenderCardBase {...props} />;
export const ProductCardKid = (props) => <GenderCardBase {...props} />;
