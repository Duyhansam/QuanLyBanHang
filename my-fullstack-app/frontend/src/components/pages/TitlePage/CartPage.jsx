import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function CartPage({ cart, onRemove, onIncrease, onDecrease }) {
  // Tính tổng tiền tạm tính
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 500 ? 0 : 15; // Phí vận chuyển miễn phí nếu tổng tiền tạm tính > 500, ngược lại là 15
  const total = subtotal + (subtotal > 0 ? shippingFee : 0);

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-wide mb-3">
          Your shopping cart is empty.
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          It looks like you haven't added any products to your cart yet. Explore
          our collections now!
        </p>
        <Link
          to="/shop"
          className="inline-block bg-black text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-gray-800 transition-colors shadow-sm"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* DANH SÁCH SẢN PHẨM (2 Cột) */}
        <div className="lg:col-span-2 divide-y divide-gray-200">
          {cart.map((item) => {
            const cartItemId =
              item.cartItemId || `${item.id}-${item.selectedSize || "M"}`;

            return (
              <div
                key={cartItemId}
                className="py-6 flex gap-4 sm:gap-6 items-center"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-24 h-28 bg-[#f4f4f4] rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain object-center"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold uppercase text-black truncate mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Size:{" "}
                    <span className="font-semibold text-black">
                      {item.selectedSize || "M"}
                    </span>
                  </p>
                  <p className="text-sm font-semibold text-black mb-4">
                    ${item.price}
                  </p>

                  {/* Nút tăng giảm số lượng trên mobile/tablet */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => onDecrease?.(cartItemId)}
                        className="p-1.5 hover:bg-gray-150 transition-colors text-gray-600 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onIncrease?.(cartItemId)}
                        className="p-1.5 hover:bg-gray-150 transition-colors text-gray-600 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onRemove?.(cartItemId);
                        toast.error("Product removed from cart.!");
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Tổng tiền của item này */}
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-bold text-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="pt-6">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Continue shopping
            </Link>
          </div>
        </div>

        {/* TỔNG KẾT ĐƠN HÀNG (1 Cột) */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-3 border-b border-gray-200">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-black">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping Fee</span>
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

          <Link
            to="/checkout"
            className="block text-center w-full bg-black text-white text-xs font-bold uppercase tracking-wider py-4 rounded hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            PROCEED TO CHECKOUT
          </Link>
        </div>
      </div>
    </div>
  );
}
