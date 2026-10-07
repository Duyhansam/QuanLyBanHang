export default function ProductInfo({ product }) {
  return (
    <div>
      {/* Danh mục & Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          {product.category}
        </span>
        {product.badge && (
          <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>

      {/* Tên sản phẩm */}
      <h1 className="text-2xl lg:text-3xl font-extrabold text-black uppercase mb-4">
        {product.name}
      </h1>

      {/* Giá tiền */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-2xl font-bold text-red-600">
          ${product.price || product.saleprice}
        </span>
        {product.originalPrice && (
          <span className="text-base text-gray-400 line-through">
            ${product.originalPrice || product.originalprice}
          </span>
        )}
        {product.discountPercent && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
            {product.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Mô tả ngắn */}
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {product.description ||
          "A high-quality product with a modern design, offering maximum comfort to the user."}
      </p>

      <hr className="border-gray-200 mb-6" />
    </div>
  );
}
