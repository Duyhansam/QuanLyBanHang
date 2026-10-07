import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Đã thêm useLocation
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage({ cart, onClearCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State lưu thông tin form người mua
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "Hà Nội",
    note: "",
    paymentMethod: "cod",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const buyNowItem = location.state?.buyNowItem;

  // Nếu là mua ngay thì chỉ hiển thị sản phẩm mua ngay, ngược lại hiển thị toàn bộ giỏ hàng
  const itemsToCheckout = buyNowItem ? [buyNowItem] : cart;

  // Tính tổng tiền
  const subtotal = itemsToCheckout.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 500 ? 0 : 15; // Phí vận chuyển miễn phí nếu tổng tiền tạm tính > 500, ngược lại là 15
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Đã đổi cart.length thành itemsToCheckout.length
    if (itemsToCheckout.length === 0) {
      toast.error("Không có sản phẩm nào để thanh toán!");
      return;
    }

    // Giả lập gửi đơn hàng thành công
    setIsSubmitted(true);

    // Nếu thanh toán giỏ hàng (không phải mua ngay) thì xóa giỏ hàng
    if (!buyNowItem) {
      onClearCart();
    }
  };

  // Giao diện khi đặt hàng thành công
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-3">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận và đang được
          xử lý. Chúng tôi sẽ liên hệ với bạn sớm nhất qua số điện thoại{" "}
          <span className="font-semibold text-black">{formData.phone}</span>.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-gray-800 transition-colors shadow-sm"
        >
          QUAY VỀ TRANG CHỦ
        </Link>
      </div>
    );
  }

  // Đã đổi từ cart sang itemsToCheckout để không chặn luồng "Mua ngay"
  if (!itemsToCheckout || itemsToCheckout.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold uppercase mb-4">
          Không có sản phẩm thanh toán
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Bạn chưa chọn sản phẩm nào để thanh toán.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          ĐẾN CỬA HÀNG
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
          <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          Thanh toán đơn hàng
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
              <Truck className="w-4 h-4" /> Thông tin giao hàng
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên của bạn"
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại liên hệ"
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                  Địa chỉ nhận hàng *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 uppercase text-[10px] text-gray-600">
                    Tỉnh / Thành phố
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
                    Ghi chú đơn hàng (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Lưu ý cho shipper..."
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Phương thức thanh toán
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
                  Thanh toán khi nhận hàng (COD)
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
                  Chuyển khoản ngân hàng qua mã QR
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (5 Cột) */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-3 border-b border-gray-200">
              Đơn hàng của bạn (
              {itemsToCheckout.reduce((sum, i) => sum + i.quantity, 0)} sản
              phẩm)
            </h2>

            {/* Danh sách nhỏ các sản phẩm - Đã đổi thành itemsToCheckout.map */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 mb-4 pr-1">
              {itemsToCheckout.map((item) => {
                const cartItemId =
                  item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;
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
                <span>Tạm tính</span>
                <span className="font-semibold text-black">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-black">
                  ${shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-black">
                <span>Tổng thanh toán</span>
                <span className="text-base text-red-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-wider py-4 rounded hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              ĐẶT HÀNG NGAY
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
