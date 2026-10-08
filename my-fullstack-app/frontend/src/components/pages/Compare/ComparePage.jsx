import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, ShoppingBag, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCompare } from "../../hooks/useCompare";

// Giống trang chi tiết: nếu API không trả sizes thì dùng danh sách mặc định
const DEFAULT_SIZES = ["S", "M", "L", "XL"];

// Các hàng thuộc tính tĩnh (Color / Size được render riêng vì có tương tác)
const ROWS = [
  { label: "Category", get: (p) => p.category },
  { label: "Badge", get: (p) => p.badge },
  { label: "Description", get: (p) => p.description },
];

export default function ComparePage({ onAddToCart }) {
  const { compareList, handleRemoveCompare, handleClearCompare } = useCompare();

  // Lựa chọn riêng cho từng sản phẩm: { [id]: { variantId, size } }
  const [selections, setSelections] = useState({});

  const getVariant = (p) => {
    const sel = selections[p.id];
    return (
      p.variants?.find((v) => v.id === sel?.variantId) ||
      p.variants?.find((v) => v.image === p.image) ||
      p.variants?.[0] ||
      null
    );
  };
  const getSize = (p) => selections[p.id]?.size || null;

  const select = (id, patch) =>
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleAdd = (p) => {
    const variant = getVariant(p);
    const size = getSize(p);
    if (!size) {
      toast.error("Please select a size first.");
      return;
    }
    onAddToCart?.({
      ...p,
      image: variant?.image || p.image,
      selectedSize: size,
      selectedColor: variant?.colorName || null,
      cartItemId: `${p.id}-${size}-${variant?.id || "default"}`, // cùng quy tắc với ProductCard
      quantity: 1,
    });
    toast.success("Product added to cart!");
  };

  if (compareList.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ArrowUpDown className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold uppercase mb-2">Nothing to compare</h2>
        <p className="text-gray-500 text-sm mb-8">
          Press COMPARE on 2–3 products to see them side by side.
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

  const lowestPrice = Math.min(...compareList.map((p) => p.price));
  const cols = `160px repeat(${compareList.length}, minmax(180px, 1fr))`;
  const labelCls =
    "text-[10px] font-bold uppercase tracking-widest text-gray-400";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-white text-black">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 font-archivo-black">
            Compare
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Comparing{" "}
            <span className="font-bold text-black">{compareList.length}</span>{" "}
            products
          </p>
        </div>
        <button
          onClick={handleClearCompare}
          className="text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hàng sản phẩm: ảnh (đổi theo màu đã chọn) + tên */}
          <div
            className="grid gap-6 pb-6"
            style={{ gridTemplateColumns: cols }}
          >
            <div />
            {compareList.map((p) => {
              const variant = getVariant(p);
              return (
                <div key={p.id} className="flex flex-col">
                  <div className="relative bg-[#f4f4f4] aspect-[4/3] flex items-center justify-center p-4 mb-3 group">
                    <button
                      onClick={() => handleRemoveCompare(p.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-white shadow-sm cursor-pointer z-10"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Link to={`/product/${p.id}`} className="w-full h-full">
                      <img
                        src={variant?.image || p.image}
                        alt={p.name}
                        className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <Link to={`/product/${p.id}`}>
                    <h3 className="text-xs font-bold uppercase line-clamp-2 hover:text-gray-600">
                      {p.name}
                    </h3>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Giá */}
          <div
            className="grid gap-6 py-4 border-t border-gray-200 items-center"
            style={{ gridTemplateColumns: cols }}
          >
            <span className={labelCls}>Price</span>
            {compareList.map((p) => (
              <div key={p.id} className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-bold ${
                    p.originalPrice ? "text-red-600" : "text-black"
                  }`}
                >
                  ${p.price}
                </span>
                {p.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ${p.originalPrice}
                  </span>
                )}
                {compareList.length > 1 && p.price === lowestPrice && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                    Best price
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Màu sắc: thumbnail bấm được */}
          <div
            className="grid gap-6 py-4 border-t border-gray-200"
            style={{ gridTemplateColumns: cols }}
          >
            <span className={labelCls}>Color</span>
            {compareList.map((p) => {
              const variant = getVariant(p);
              return (
                <div key={p.id}>
                  {p.variants?.length ? (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {p.variants.map((v, i) => (
                          <button
                            key={v.id ?? i}
                            onClick={() => select(p.id, { variantId: v.id })}
                            title={v.colorName}
                            className={`w-12 h-12 rounded overflow-hidden border transition-all cursor-pointer ${
                              variant?.id === v.id
                                ? "border-black ring-1 ring-black scale-105"
                                : "border-gray-300 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={v.thumbnail || v.image}
                              alt={v.colorName}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {variant?.colorName}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Size: nút chọn giống trang chi tiết */}
          <div
            className="grid gap-6 py-4 border-t border-gray-200"
            style={{ gridTemplateColumns: cols }}
          >
            <span className={labelCls}>Size</span>
            {compareList.map((p) => {
              const size = getSize(p);
              return (
                <div key={p.id} className="flex items-center gap-2 flex-wrap">
                  {(p.sizes?.length ? p.sizes : DEFAULT_SIZES).map((s) => (
                    <button
                      key={s}
                      onClick={() => select(p.id, { size: s })}
                      className={`w-12 h-10 border text-xs font-bold transition-all cursor-pointer rounded ${
                        size === s
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-black hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Các hàng thuộc tính tĩnh */}
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="grid gap-6 py-4 border-t border-gray-200"
              style={{ gridTemplateColumns: cols }}
            >
              <span className={labelCls}>{row.label}</span>
              {compareList.map((p) => (
                <span
                  key={p.id}
                  className="text-xs text-gray-700 leading-relaxed"
                >
                  {row.get(p) || "—"}
                </span>
              ))}
            </div>
          ))}

          {/* Nút Add to Cart đặt cuối, sau khi đã chọn màu + size */}
          <div
            className="grid gap-6 pt-6 border-t border-gray-200"
            style={{ gridTemplateColumns: cols }}
          >
            <div />
            {compareList.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p)}
                className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
