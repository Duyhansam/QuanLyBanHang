import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../hooks/userApi";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  PAYMENT_LABEL,
  STATUS_INFO,
  formatDate,
  formatMoney,
} from "./orderUtils";

const PAGE_SIZE = 15;

// Trạng thái tiếp theo được phép (backend vẫn kiểm tra lại, đây chỉ để hiện nút)
const NEXT_ACTIONS = {
  PENDING: [
    { status: "CONFIRMED", label: "Confirm order", primary: true },
    { status: "CANCELLED", label: "Cancel order", danger: true },
  ],
  CONFIRMED: [
    { status: "SHIPPING", label: "Start shipping", primary: true },
    { status: "CANCELLED", label: "Cancel order", danger: true },
  ],
  SHIPPING: [
    { status: "DELIVERED", label: "Mark as delivered", primary: true },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

const TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const token = user?.token ?? null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  const loadOrders = useCallback(() => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError(null);
    apiFetch("/api/admin/orders", token)
      .then((rows) => setOrders(rows ?? []))
      .catch((err) => {
        if (err.status === 401) {
          logout();
          toast.error("Your session has expired. Please sign in again.");
        } else if (err.status === 403) {
          setError("You don't have ADMIN permission.");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  useEffect(loadOrders, [loadOrders]);

  // Đổi bộ lọc thì quay về trang 1
  useEffect(() => setPage(1), [tab, search]);

  const counts = useMemo(() => {
    const c = { ALL: orders.length };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "ALL" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.fullName.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });
  }, [orders, tab, search]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="px-8 py-24 text-center">
        <h1 className="text-2xl font-bold">
          You don't have access to this page
        </h1>
        <p className="mt-2 text-gray-600">
          The admin area is only available to ADMIN accounts.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-bold underline">
          Back to home
        </Link>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeStatus = async (order, action) => {
    const ask =
      action.status === "CANCELLED"
        ? `Cancel order #${order.code}? This cannot be undone.`
        : `${action.label} for order #${order.code}?`;
    if (!window.confirm(ask)) return;

    setBusyId(order.id);
    try {
      const updated = await apiFetch(
        `/api/admin/orders/${order.id}/status`,
        token,
        { method: "PATCH", body: JSON.stringify({ status: action.status }) },
      );
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(
        `Order #${updated.code}: ${STATUS_INFO[updated.status].label}`,
      );
    } catch (err) {
      toast.error(err.message || "Could not change the status.");
      loadOrders(); // đồng bộ lại nếu đơn đã bị đổi ở nơi khác
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 py-9 text-black">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase md:text-3xl">
            Order management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} orders in the store
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded border border-gray-300 px-5 py-3 text-xs font-bold uppercase hover:border-black"
        >
          ← Product management
        </Link>
      </div>

      {/* Tab trạng thái */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded px-3 py-2 text-xs font-bold uppercase transition-colors ${
              tab === t
                ? "bg-black text-white"
                : "border border-gray-300 text-gray-600 hover:border-black"
            }`}
          >
            {t === "ALL" ? "All" : STATUS_INFO[t].label} ({counts[t] ?? 0})
          </button>
        ))}
      </div>

      <div className="my-6 relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order code, name or phone number"
          className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading orders...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">No orders found.</p>
      )}

      <div className="space-y-3">
        {visible.map((order) => {
          const open = openId === order.id;
          const actions = NEXT_ACTIONS[order.status] ?? [];
          return (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(open ? null : order.id)}
                className="flex w-full cursor-pointer flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left hover:bg-gray-50"
              >
                <span className="w-24 text-sm font-bold">#{order.code}</span>
                <span className="min-w-[8rem] flex-1 text-xs">
                  <span className="block font-semibold">{order.fullName}</span>
                  <span className="text-gray-500">{order.phone}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
                <span className="w-20 text-right text-sm font-bold">
                  {formatMoney(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
                {open ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {open && (
                <div className="grid grid-cols-1 gap-6 border-t border-gray-200 bg-gray-50 p-5 lg:grid-cols-12">
                  <div className="divide-y divide-gray-200 rounded border border-gray-200 bg-white lg:col-span-7">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-14 w-12 rounded border bg-gray-50 object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-bold uppercase">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {item.colorName ? `${item.colorName} | ` : ""}Size:{" "}
                            {item.selectedSize} | SL: {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-bold">
                          {formatMoney(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 text-xs lg:col-span-5">
                    <div className="space-y-1 rounded border border-gray-200 bg-white p-4">
                      <p className="font-semibold">{order.fullName}</p>
                      <p className="text-gray-600">{order.phone}</p>
                      <p className="text-gray-600">
                        {order.address}
                        {order.city ? `, ${order.city}` : ""}
                      </p>
                      {order.note && (
                        <p className="italic text-gray-500">
                          Note: {order.note}
                        </p>
                      )}
                      <p className="pt-1 text-gray-600">
                        {PAYMENT_LABEL[order.paymentMethod] ??
                          order.paymentMethod}
                      </p>
                      <p className="border-t border-gray-100 pt-2 text-gray-600">
                        Subtotal {formatMoney(order.subtotal)} + shipping{" "}
                        {formatMoney(order.shippingFee)} ={" "}
                        <span className="font-bold text-black">
                          {formatMoney(order.total)}
                        </span>
                      </p>
                    </div>

                    {actions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {actions.map((a) => (
                          <button
                            key={a.status}
                            disabled={busyId === order.id}
                            onClick={() => changeStatus(order, a)}
                            className={`cursor-pointer rounded px-4 py-3 text-xs font-bold uppercase transition-colors disabled:opacity-50 ${
                              a.danger
                                ? "border border-red-300 text-red-600 hover:bg-red-50"
                                : "bg-black text-white hover:bg-neutral-800"
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        This order is closed. Its status can no longer be
                        changed.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-xs font-bold">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer rounded border border-gray-300 px-4 py-2 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span>
            Page {page} / {pageCount}
          </span>
          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer rounded border border-gray-300 px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
