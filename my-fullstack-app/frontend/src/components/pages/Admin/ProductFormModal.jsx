import { useEffect, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { uploadImage } from "../../hooks/userApi";
import { SHOE_SIZES } from "../../constants/sizes";

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
      stocks: {}, // { "36": "5", ... } (chuỗi để ô nhập có thể để trống)
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
    stocks: {}, // được điền sau khi tải tồn kho từ backend
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
  const { user } = useAuth();
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Sửa sản phẩm: phải tải xong tồn kho hiện tại rồi mới cho lưu (tránh vô tình xóa tồn kho)
  const [stockLoaded, setStockLoaded] = useState(!product);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    fetch(`/api/products/${product.id}/stock`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => {
        if (cancelled) return;
        const stocks = {};
        if (data?.tracked) {
          for (const [size, qty] of Object.entries(data.sizes)) {
            stocks[size] = String(qty);
          }
        }
        setForm((f) => ({ ...f, stocks }));
        setStockLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(
            "Could not load the current stock. Please close and reopen this form!",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

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

  const setStock = (size, value) =>
    setForm((f) => ({ ...f, stocks: { ...f.stocks, [size]: value } }));

  // Chọn ảnh từ máy -> upload lên backend -> điền đường dẫn trả về vào ô ảnh
  const handleUpload = async (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5MB)!");
      return;
    }
    setUploadingIndex(index);
    try {
      const url = await uploadImage(file, user?.token);
      setForm((f) => ({
        ...f,
        variants: f.variants.map((v, i) =>
          i === index
            ? {
                ...v,
                image: url,
                // ảnh nhỏ đang trùng ảnh cũ thì xóa đi để backend dùng ảnh mới
                thumbnail: v.thumbnail === v.image ? "" : v.thumbnail,
              }
            : v,
        ),
      }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Image upload failed!");
    } finally {
      setUploadingIndex(null);
    }
  };

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
      // Chỉ gửi các size có nhập số. Không nhập size nào = không quản lý tồn kho.
      sizeStocks: Object.fromEntries(
        Object.entries(form.stocks)
          .filter(([, qty]) => qty !== "" && qty != null)
          .map(([size, qty]) => [
            size,
            Math.max(0, Math.floor(Number(qty)) || 0),
          ]),
      ),
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
            {isEdit ? `Edit product #${product.id}` : "Add new product"}
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
            <label className={labelCls}>Product name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="TRACKER BOOT AT MENS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price ($) *</label>
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
              <label className={labelCls}>
                Original price ($) - only if on sale
              </label>
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
                <option value="">(None)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Shoe type</label>
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="">(None)</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select
                className={inputCls}
                value={form.brandId}
                onChange={(e) => set("brandId", e.target.value)}
              >
                <option value="">(None)</option>
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
              <label className={labelCls}>Badge</label>
              <input
                className={inputCls}
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="NEW STYLE, LIMITED EDITION..."
              />
            </div>
            <div>
              <label className={labelCls}>Main color (optional)</label>
              <input
                className={inputCls}
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Stock by size</label>
            <p className="mb-3 text-xs text-gray-500">
              Enter the quantity in stock for each size. Leave every field empty
              to turn off stock tracking (unlimited sales). Once any size is
              filled in, the empty sizes count as sold out.
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {SHOE_SIZES.map((size) => (
                <div key={size}>
                  <span className="mb-1 block text-center text-[11px] font-bold text-gray-600">
                    {size}
                  </span>
                  <input
                    type="number"
                    min="0"
                    className={inputCls + " px-1 text-center"}
                    value={form.stocks[size] ?? ""}
                    onChange={(e) => setStock(size, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Colors and images *</label>
              <button
                type="button"
                onClick={addVariant}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold uppercase hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add color
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Enter an image path such as{" "}
              <code className="rounded bg-gray-100 px-1">
                /images/products/categoryimg/boots/v1-black.png
              </code>
              . Or click the upload icon on each row to pick an image from your
              computer (PNG, JPG, WEBP, GIF, max 5MB).
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
                      <span className="text-[10px] text-gray-400">Image</span>
                    )}
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      className={inputCls}
                      placeholder="Color name (Black)"
                      value={v.colorName}
                      onChange={(e) =>
                        setVariant(i, "colorName", e.target.value)
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Image path *"
                      value={v.image}
                      onChange={(e) => setVariant(i, "image", e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Thumbnail (empty = use the main image)"
                      value={v.thumbnail}
                      onChange={(e) =>
                        setVariant(i, "thumbnail", e.target.value)
                      }
                    />
                  </div>
                  <label
                    title="Upload an image from your computer"
                    className="cursor-pointer p-2 text-gray-500 hover:text-black"
                  >
                    {uploadingIndex === i ? (
                      <span className="text-[10px]">...</span>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingIndex !== null}
                      onChange={(e) => {
                        handleUpload(i, e.target.files?.[0]);
                        e.target.value = ""; // cho phép chọn lại đúng file đó
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    title="Remove this color"
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
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !stockLoaded}
            className="cursor-pointer rounded bg-black px-6 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}
