import { useState, useEffect } from "react";
import { Heart, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCompare } from "../../hooks/useCompare";

function BasicCardBase({
  product,
  onToggleWishlist,
  onAddToCart,
  isInitiallyLiked,
  showVariants = true,
  renderInfo,
}) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] ?? null);
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyLiked || false);
  const { isInCompare, handleToggleCompare } = useCompare();
  const inCompare = isInCompare(product.id);

  const handleCompareClick = () => {
    handleToggleCompare({
      ...product,
      image: selectedVariant?.image || product.image,
    });
  };
  const to = `/product/${product.id}`;

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
      toast.success("Product added to cart.!");
    }
  };

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="relative bg-[#f4f4f4] aspect-[4/3] flex items-center justify-center p-4 overflow-hidden mb-3 group cursor-pointer">
        {product.badge && (
          <span className="absolute top-3 right-3 bg-white text-black text-[9px] font-bold px-2.5 py-1 rounded border border-gray-200 uppercase tracking-wider z-10 shadow-sm">
            {product.badge}
          </span>
        )}
        <Link to={to}>
          <img
            src={selectedVariant?.image ?? ""}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {showVariants && (
        <div className="flex items-center gap-1.5 mb-3">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              className={`w-12 h-12 rounded overflow-hidden border transition-all ${
                selectedVariant?.id === variant.id
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
        </div>
      )}

      {renderInfo ? (
        renderInfo(product, to)
      ) : (
        <Link to={to}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xs font-bold text-black uppercase cursor-pointer">
              {product.name}
            </h3>
            <span className="text-xs font-semibold whitespace-nowrap text-black">
              ${product.price}
            </span>
          </div>
          <p className="text-[11px] mb-3 line-clamp-1 text-gray-500">
            {product.description}
          </p>
        </Link>
      )}

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

const saleInfo = (product, to) => (
  <div className="flex flex-col items-start gap-2 mb-1">
    <Link to={to}>
      <h3 className="text-xs font-bold text-black uppercase line-clamp-2 cursor-pointer">
        {product.name}
      </h3>
    </Link>
    <div className="flex flex-col gap-1 text-gray-500 mb-3 text-sm">
      <span className="truncate max-w-[120px]">{product.category}</span>
      <span>Color: {product.color}</span>
    </div>
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold whitespace-nowrap text-red-600">
        ${product.price}
      </span>
      {product.originalPrice && (
        <span className="text-xs font-medium text-gray-400 line-through">
          ${product.originalPrice || product.originalprice}
        </span>
      )}
      {product.discountPercent && (
        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
          {product.discountPercent}% OFF
        </span>
      )}
    </div>
  </div>
);

export const ProductCard = (props) => <BasicCardBase {...props} />;
export const ProductCardSale = (props) => (
  <BasicCardBase {...props} showVariants={false} renderInfo={saleInfo} />
);
