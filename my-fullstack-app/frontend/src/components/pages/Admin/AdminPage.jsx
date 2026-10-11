import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import ProductFormModal, { CATEGORIES, TYPES } from "./ProductFormModal.jsx";

const PAGE_SIZE = 15;

// Gọi API kèm token và lấy luôn thông báo lỗi do backend trả về ({ "message": "..." })
async function adminFetch(path, token, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Bạn không có quyền ADMIN (hãy đăng nhập lại bằng tài khoản admin).",
    );
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(body?.message || `Lỗi ${res.status}`);
  return body;
}

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth();
  const { data: brands } = useFetch("/api/brands");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(undefined); // undefined = đóng, null = thêm mới, object = sửa
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((list) => setProducts([...list].sort((a, b) => b.id - a.id)))
      .catch((err) => toast.error("Không tải được sản phẩm: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || String(p.id) === q;
    });
  }, [products, search, typeFilter, categoryFilter]);

  // Đổi bộ lọc thì quay về trang 1
  useEffect(() => setPage(1), [search, typeFilter, categoryFilter]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (user.role !== "ADMIN") {
    return (
      <div className="px-8 py-24 text-center">
        <h1 className="text-2xl font-bold">
          Bạn không có quyền truy cập trang này
        </h1>
        <p className="mt-2 text-gray-600">
          Trang quản trị chỉ dành cho tài khoản ADMIN.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-bold underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = async (payload) => {
    const isEdit = Boolean(editing);
    setSaving(true);
    try {
      await adminFetch(
        isEdit ? `/api/products/${editing.id}` : "/api/products",
        user.token,
        { method: isEdit ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      toast.success(isEdit ? "Đã lưu thay đổi." : "Đã thêm sản phẩm.");
      setEditing(undefined);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `Xóa "${product.name}" (#${product.id})?\nSản phẩm cũng sẽ bị gỡ khỏi giỏ hàng và wishlist của mọi người.`,
      )
    ) {
      return;
    }
    try {
      await adminFetch(`/api/products/${product.id}`, user.token, {
        method: "DELETE",
      });
      toast.success("Đã xóa sản phẩm.");
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const selectCls =
    "border border-gray-300 rounded px-3 py-2 text-xs font-bold uppercase outline-none focus:border-black bg-white";

  return (
    <div className="min-h-screen bg-white px-8 py-9 text-black">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase md:text-3xl">
            Quản trị sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} sản phẩm trong cửa hàng
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex cursor-pointer items-center gap-2 rounded bg-black px-5 py-3 text-xs font-bold uppercase text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="my-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc id"
            className="w-64 rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
          />
        </div>
        <select
          className={selectCls}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Mọi loại giày</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Mọi category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{filtered.length} kết quả</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Hãng</th>
              <th className="px-4 py-3">Màu</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
            {visible.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-2">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-gray-100">
                    {p.variants?.[0]?.image && (
                      <img
                        src={p.variants[0].image}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-500">#{p.id}</td>
                <td className="px-4 py-2 font-semibold">{p.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  ${p.price}
                  {p.originalPrice && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      ${p.originalPrice}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs">{p.category ?? "-"}</td>
                <td className="px-4 py-2 text-xs">{p.type ?? "-"}</td>
                <td className="px-4 py-2 text-xs">{p.brand?.name ?? "-"}</td>
                <td className="px-4 py-2 text-xs">{p.variants?.length ?? 0}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditing(p)}
                      title="Sửa"
                      className="cursor-pointer rounded p-2 hover:bg-gray-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Xóa"
                      className="cursor-pointer rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer rounded border border-gray-300 px-4 py-2 text-xs font-bold uppercase disabled:opacity-40"
          >
            Trước
          </button>
          <span>
            Trang {page} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="cursor-pointer rounded border border-gray-300 px-4 py-2 text-xs font-bold uppercase disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}

      {editing !== undefined && (
        <ProductFormModal
          key={editing ? editing.id : "new"}
          product={editing}
          brands={brands}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
