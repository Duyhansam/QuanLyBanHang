import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../hooks/userApi";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatDate, formatMoney } from "./orderUtils";

export default function OrdersPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const token = user?.token ?? null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    apiFetch("/api/orders", token)
      .then((rows) => {
        if (!cancelled) setOrders(rows ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) logout();
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-[60vh]">
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        My orders
      </h1>

      {loading && <p className="text-sm text-gray-500">Loading orders...</p>}
      {error && (
        <p className="text-sm text-red-500">Failed to load data: {error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <PackageOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm mb-6">
            You don't have any orders yet.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            GO TO SHOP
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const count = order.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block border border-gray-200 rounded-lg p-5 hover:border-black hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold">#{order.code}</p>
                  <p className="text-[11px] text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                {order.items.slice(0, 4).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-14 object-contain bg-gray-50 border rounded p-1"
                  />
                ))}
                {order.items.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{order.items.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                <span className="text-gray-500">{count} items</span>
                <span className="font-bold text-sm">
                  {formatMoney(order.total)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
