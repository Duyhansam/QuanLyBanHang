// Nhãn và màu hiển thị cho từng trạng thái đơn hàng
export const STATUS_INFO = {
  PENDING: { label: "Pending", className: "bg-yellow-50 text-yellow-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-50 text-blue-700" },
  SHIPPING: { label: "Shipping", className: "bg-indigo-50 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-50 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600" },
};

export const PAYMENT_LABEL = {
  COD: "Cash on delivery (COD)",
  BANKING: "Bank transfer",
};

export const formatMoney = (n) => `$${Number(n ?? 0).toFixed(2)}`;

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
