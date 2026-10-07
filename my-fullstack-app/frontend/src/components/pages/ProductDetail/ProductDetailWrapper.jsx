import { useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import ProductDetail from "./ProductDetail.jsx";

export default function ProductDetailWrapper({
  wishlist = [],
  handleAddToWishlist,
  onAddToCart,
}) {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(`/api/products/${id}`);

  if (loading) {
    return <div className="p-12 text-center">Đang tải sản phẩm...</div>;
  }
  if (error || !product) {
    return <div className="p-12 text-center">Không tìm thấy sản phẩm!</div>;
  }

  const isInitiallyLiked = wishlist.some((item) => item.id === product.id);

  return (
    <ProductDetail
      product={product}
      onAddToCart={onAddToCart}
      handleAddToWishlist={(prod, isLiked) =>
        handleAddToWishlist(prod, isLiked)
      }
      isInitiallyLiked={isInitiallyLiked}
    />
  );
}
