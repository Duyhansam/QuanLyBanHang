import { useState, useEffect } from "react";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductOptions from "./ProductOptions";
import ProductPolicy from "./ProductPolicy";
import ProductReviews from "./ProductReviews";
import { DEFAULT_SIZE, SHOE_SIZES } from "../../constants/sizes";

export default function ProductDetail({
  product,
  onAddToCart,
  handleAddToWishlist,
  isInitiallyLiked,
}) {
  if (!product)
    return <div className="p-8 text-center">Product not found.</div>;

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || DEFAULT_SIZE,
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyLiked || false);

  // Tồn kho theo size: { "36": 5, "37": 0 }. null = sản phẩm chưa quản lý tồn kho (bán không giới hạn)
  const [stock, setStock] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStock(null);
    fetch(`/api/products/${product.id}/stock`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setStock(data?.tracked ? data.sizes : null);
      })
      .catch(() => {}); // lỗi mạng thì coi như không giới hạn, backend vẫn chặn khi đặt hàng
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Size đang chọn đã hết hàng thì nhảy sang size đầu tiên còn hàng; số lượng không vượt quá tồn kho
  useEffect(() => {
    if (!stock) return;
    const sizes = product.sizes || SHOE_SIZES;
    const left = stock[selectedSize] ?? 0;
    if (left <= 0) {
      const firstAvailable = sizes.find((s) => (stock[s] ?? 0) > 0);
      if (firstAvailable) setSelectedSize(firstAvailable);
    } else if (quantity > left) {
      setQuantity(left);
    }
  }, [stock, selectedSize, quantity, product.sizes]);

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
            stock={stock}
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

      <ProductReviews key={product.id} productId={product.id} />
    </div>
  );
}
