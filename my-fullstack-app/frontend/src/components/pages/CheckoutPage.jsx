import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Đã thêm useLocation
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { DEFAULT_SIZE } from "../constants/sizes";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, findVariantId } from "../hooks/userApi";

export default function CheckoutPage({ cart, onClearCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  // State lưu thông tin form người mua
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "Hanoi",
    note: "",
    paymentMethod: "cod",
  });

  // Điền sẵn họ tên / điện thoại / địa chỉ từ hồ sơ tài khoản (chỉ điền vào ô còn trống)
  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    apiFetch("/api/v1/auth/me", user.token)
      .then((me) => {
        if (cancelled || !me) return;
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || me.fullName || "",
          phone: prev.phone || me.phone || "",
          address: prev.address || me.address || "",
          city: me.city && prev.city === "Hanoi" ? me.city : prev.city,
        }));
      })
      .catch(() => {}); // không điền sẵn được thì thôi, người dùng tự nhập
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const [placedOrder, setPlacedOrder] = useState(null); // đơn do backend trả về
  const [submitting, setSubmitting] = useState(false);
  const buyNowItem = location.state?.buyNowItem;

  // Nếu là mua ngay thì chỉ hiển thị sản phẩm mua ngay, ngược lại hiển thị toàn bộ giỏ hàng
  const itemsToCheckout = buyNowItem ? [buyNowItem] : cart;

  // Tính tổng tiền
  const subtotal = itemsToCheckout.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 500 ? 0 : 15; // Shipping fee miễn phí nếu tổng tiền tạm tính > 500, ngược lại là 15
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (itemsToCheckout.length === 0) {
      toast.error("There are no products to check out!");
      return;
    }

    // Đặt hàng thật cần tài khoản: chuyển sang trang đăng nhập rồi quay lại đây
    if (!isLoggedIn) {
      toast.error("Please sign in to place your order.");
      navigate("/login", {
        state: { from: "/checkout", checkoutState: location.state },
      });
      return;
    }

    // Chỉ gửi sản phẩm khi "Mua ngay". Thanh toán giỏ hàng thì để trống:
    // backend tự lấy giỏ của người dùng. Giá luôn do backend tính từ DB.
    const items = buyNowItem
      ? [
          {
            productId: buyNowItem.id,
            variantId: findVariantId(buyNowItem),
            selectedSize: buyNowItem.selectedSize || DEFAULT_SIZE,
            quantity: buyNowItem.quantity || 1,
          },
        ]
      : null;

    setSubmitting(true);
    try {
      const order = await apiFetch("/api/orders", user.token, {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          note: formData.note,
          paymentMethod: formData.paymentMethod.toUpperCase(),
          items,
        }),
      });
      setPlacedOrder(order);
      // Backend đã xóa giỏ trên server; dọn nốt giỏ trong giao diện
      if (!buyNowItem) onClearCart();
    } catch (err) {
      if (err.status === 401) {
        logout();
        toast.error("Your session has expired. Please sign in again.");
      } else {
        toast.error(
          err.message || "Failed to place the order. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Giao diện khi đặt hàng thành công
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-3">
          Order placed successfully!
        </h1>
        <p className="text-sm font-bold mb-2">
          Order code: #{placedOrder.code}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Thank you for shopping with us. Your order has been received and is
          being processed. We will contact you as soon as possible at{" "}
          <span className="font-semibold text-black">{placedOrder.phone}</span>.
          Total:{" "}
          <span className="font-semibold text-black">
            ${placedOrder.total.toFixed(2)}
          </span>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/orders/${placedOrder.id}`}
            className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-gray-800 transition-colors shadow-sm"
          >
            VIEW ORDER
          </Link>
          <Link
            to="/"
            className="inline-block border border-gray-300 text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:border-black transition-colors"
          >
            BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  // Đã đổi từ cart sang itemsToCheckout để không chặn luồng "Mua ngay"
  if (!itemsToCheckout || itemsToCheckout.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold uppercase mb-4">
          Nothing to check out
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          You haven't selected any products to check out.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          GO TO SHOP
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          Checkout
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        {/* CỘT TRÁI: FORM THÔNG TIN GIAO HÀNG (7 Cột) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Recipient's full name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Phone number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your contact phone number"
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Delivery address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, apartment, etc."
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                    City / Province
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                    Order notes (optional)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Notes for the courier..."
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Payment method
            </h2>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleChange}
                  className="accent-black"
                />
                <span className="font-medium text-black">
                  Cash on delivery (COD)
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="banking"
                  checked={formData.paymentMethod === "banking"}
                  onChange={handleChange}
                  className="accent-black"
                />
                <span className="font-medium text-black">
                  Bank transfer via QR code
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (5 Cột) */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-3 border-b border-gray-200">
              Your order (
              {itemsToCheckout.reduce((sum, i) => sum + i.quantity, 0)} items)
            </h2>

            {/* Danh sách nhỏ các sản phẩm - Đã đổi thành itemsToCheckout.map */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 mb-4 pr-1">
              {itemsToCheckout.map((item) => {
                const cartItemId =
                  item.cartItemId ||
                  `${item.id}-${item.selectedSize || DEFAULT_SIZE}`;
                return (
                  <div
                    key={cartItemId}
                    className="py-3 flex items-center gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-contain bg-white border rounded p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Size: {item.selectedSize} | SL: {item.quantity}
                      </p>
                    </div>
                    {/* Đã thêm dấu nhân * vào biểu thức tính toán */}
                    <span className="text-xs font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs mb-6 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-black">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping fee</span>
                <span className="font-semibold text-black">
                  ${shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-black">
                <span>Total</span>
                <span className="text-base text-red-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-wider py-4 rounded hover:bg-gray-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "PROCESSING..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
