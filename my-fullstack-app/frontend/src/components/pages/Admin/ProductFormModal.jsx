import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

export const CATEGORIES = ["MEN", "WOMEN", "KID", "SHOP", "BESTSELLER", "SALE"];
export const TYPES = [
  "BOOTS",
  "RUNNING",
  "LIFESTYLE",
  "WALKING",
  "TRAINING",
  "SNEAKERS",
  "SANDALS",
];

const emptyVariant = () => ({
  id: null,
  colorName: "",
  image: "",
  thumbnail: "",
});

function toForm(product) {
  if (!product) {
    return {
      name: "",
      price: "",
      originalPrice: "",
      badge: "",
      description: "",
      category: "",
      type: "",
      color: "",
      brandId: "",
      variants: [emptyVariant()],
    };
  }
  return {
    name: product.name ?? "",
    price: product.price ?? "",
    originalPrice: product.originalPrice ?? "",
    badge: product.badge ?? "",
    description: product.description ?? "",
    category: product.category ?? "",
    type: product.type ?? "",
    color: product.color ?? "",
    brandId: product.brand?.id ?? "",
    variants: product.variants?.length
      ? product.variants.map((v) => ({
          id: v.id,
          colorName: v.colorName ?? "",
          image: v.image ?? "",
          thumbnail: v.thumbnail ?? "",
        }))
      : [emptyVariant()],
  };
}

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black";
const labelCls =
  "block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1";

export default function ProductFormModal({
  product,
  brands,
  saving,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() => toForm(product));
  const isEdit = Boolean(product);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setVariant = (index, field, value) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));

  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));

  const removeVariant = (index) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));

  const handleSubmit = () => {
    onSave({
      name: form.name,
      price: form.price === "" ? null : Number(form.price),
      originalPrice:
        form.originalPrice === "" ? null : Number(form.originalPrice),
      badge: form.badge,
      description: form.description,
      category: form.category,
      type: form.type,
      color: form.color,
      brandId: form.brandId === "" ? null : Number(form.brandId),
      variants: form.variants.map((v) => ({
        id: v.id,
        colorName: v.colorName,
        image: v.image,
        thumbnail: v.thumbnail,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold uppercase">
            {isEdit ? `Sửa sản phẩm #${product.id}` : "Thêm sản phẩm mới"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className={labelCls}>Tên sản phẩm *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="TRACKER BOOT AT MENS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Giá bán ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Giá gốc ($) - chỉ khi giảm giá</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">(Không)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Loại giày (type)</label>
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">(Không)</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Thương hiệu</label>
              <select
                className={inputCls}
                value={form.brandId}
                onChange={(e) => set("brandId", e.target.value)}
              >
                <option value="">(Không)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nhãn (badge)</label>
              <input
                className={inputCls}
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="NEW STYLE, LIMITED EDITION..."
              />
            </div>
            <div>
              <label className={labelCls}>Màu chính (tùy chọn)</label>
              <input
                className={inputCls}
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Mô tả</label>
            <textarea
              rows={3}
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Các màu và ảnh *</label>
              <button
                type="button"
                onClick={addVariant}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold uppercase hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm màu
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Ảnh nhập đường dẫn như{" "}
              <code className="rounded bg-gray-100 px-1">
                /images/products/categoryimg/boots/v1-black.png
              </code>
              . Hãy chép file ảnh vào thư mục static của backend trước.
            </p>

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                    {v.image ? (
                      <img
                        src={v.image}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                        onLoad={(e) => (e.currentTarget.style.opacity = 1)}
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">Ảnh</span>
                    )}
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      className={inputCls}
                      placeholder="Tên màu (Black)"
                      value={v.colorName}
                      onChange={(e) =>
                        setVariant(i, "colorName", e.target.value)
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Đường dẫn ảnh *"
                      value={v.image}
                      onChange={(e) => setVariant(i, "image", e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Ảnh nhỏ (trống = dùng ảnh chính)"
                      value={v.thumbnail}
                      onChange={(e) =>
                        setVariant(i, "thumbnail", e.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    title="Xóa màu này"
                    className="cursor-pointer p-2 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded border border-gray-300 px-5 py-2 text-xs font-bold uppercase hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="cursor-pointer rounded bg-black px-6 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
