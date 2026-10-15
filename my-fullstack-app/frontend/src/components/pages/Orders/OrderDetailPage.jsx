import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../hooks/userApi";
import OrderStatusBadge from "./OrderStatusBadge";
import { PAYMENT_LABEL, formatDate, formatMoney } from "./orderUtils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn, logout } = useAuth();
  const token = user?.token ?? null;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/api/orders/${id}`, token)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) logout();
        else setError(err.status === 404 ? "Order not found." : err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const updated = await apiFetch(`/api/orders/${id}/cancel`, token, {
        method: "POST",
      });
      setOrder(updated);
      toast.success("Order cancelled.");
    } catch (err) {
      toast.error(err.message || "Could not cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (loading) return <div className="px-8 py-12">Loading orders...</div>;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/orders" className="text-sm font-bold underline">
          ← Back to my orders
        </Link>
      </div>
    );
  }
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> My orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Order #{order.code}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-7 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <img
                src={item.image}
                alt={item.productName}
                className="w-16 h-20 object-contain bg-gray-50 border rounded p-1"
              />
              <div className="flex-1 min-w-0">
                {item.productId ? (
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-xs font-bold uppercase hover:underline line-clamp-2"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <p className="text-xs font-bold uppercase">
                    {item.productName}
                  </p>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
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

        {/* Shipping information + tổng tiền */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-xs space-y-1.5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
              Shipping information
            </h2>
            <p className="font-semibold">{order.fullName}</p>
            <p className="text-gray-600">{order.phone}</p>
            <p className="text-gray-600">
              {order.address}
              {order.city ? `, ${order.city}` : ""}
            </p>
            {order.note && (
              <p className="text-gray-500 italic">Note: {order.note}</p>
            )}
            <p className="pt-2 text-gray-600">
              {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-xs space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-black">
                {formatMoney(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping fee</span>
              <span className="font-semibold text-black">
                {formatMoney(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-bold">
              <span>Total</span>
              <span className="text-base text-red-600">
                {formatMoney(order.total)}
              </span>
            </div>
          </div>

          {order.status === "PENDING" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full border border-red-300 text-red-600 text-xs font-bold uppercase tracking-wider py-3 rounded hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? "Cancelling..." : "Cancel order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
