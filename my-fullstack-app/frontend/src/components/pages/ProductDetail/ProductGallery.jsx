export default function ProductGallery({
  product,
  selectedVariant,
  onSelectVariant,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính lớn */}
      <div className="bg-[#f4f4f4] aspect-square rounded-lg flex items-center justify-center p-6 border border-gray-100 overflow-hidden">
        <img
          src={selectedVariant ? selectedVariant.image : product.image}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Danh sách ảnh nhỏ (Thumbnails) */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {product.variants.map((variant, index) => (
            <button
              key={variant.id || index}
              onClick={() => onSelectVariant(variant)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                selectedVariant?.image === variant.image
                  ? "border-black ring-1 ring-black"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={variant.thumbnail || variant.image}
                alt={variant.colorName || "variant"}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
