import { useState, useEffect } from "react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductOptions from "./ProductOptions";
import ProductPolicy from "./ProductPolicy";

export default function ProductDetail({
  product,
  onAddToCart,
  handleAddToWishlist,
  isInitiallyLiked,
}) {
  if (!product)
    return <div className="p-8 text-center">Không tìm thấy sản phẩm.</div>;

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyLiked || false);

  // Cập nhật lại trạng thái yêu thích mỗi khi sản phẩm hoặc prop ban đầu thay đổi
  useEffect(() => {
    setIsWishlisted(isInitiallyLiked || false);
    setSelectedVariant(product.variants?.[0] || null);
  }, [product, isInitiallyLiked]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cột trái: Ảnh */}
        <ProductGallery
          product={product}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />

        {/* Cột phải: Thông tin & Lựa chọn */}
        <div className="flex flex-col justify-start">
          <ProductInfo product={product} />

          <ProductOptions
            product={product}
            selectedVariant={selectedVariant}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isWishlisted={isWishlisted}
            onToggleWishlist={(prod, state) => {
              setIsWishlisted(state);
              if (handleAddToWishlist) {
                // Đảm bảo đính kèm ảnh của biến thể đang được chọn vào object lưu vào wishlist
                const activeImage = selectedVariant?.image || product.image;
                handleAddToWishlist(
                  {
                    ...prod,
                    image: activeImage,
                  },
                  state,
                );
              }
            }}
            onAddToCart={onAddToCart}
          />

          <ProductPolicy />
        </div>
      </div>
    </div>
  );
}
