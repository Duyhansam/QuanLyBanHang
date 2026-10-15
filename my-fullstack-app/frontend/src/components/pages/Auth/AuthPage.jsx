import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // true: Sign in, false: Sign up
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  // Nếu được chuyển từ trang Checkout sang đây thì đăng nhập xong quay lại đúng chỗ đó
  const location = useLocation();
  // Trang cần đăng nhập (giỏ hàng, thanh toán...) chuyển sang /login kèm state { from, checkoutState }
  // để đăng nhập xong quay lại đúng trang đó.
  const redirectTo = location.state?.from ?? "/";
  const redirectState = location.state?.checkoutState;

  // Đã đăng nhập rồi thì không cần ở trang login nữa
  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTo, { replace: true, state: redirectState });
    }
  }, [isLoggedIn, navigate, redirectTo, redirectState]);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Bị backend khóa tạm thời (HTTP 429) do nhập sai mật khẩu quá nhiều lần
  const [lockSeconds, setLockSeconds] = useState(0);
  const locked = isLogin && lockSeconds > 0;
  // Đổi số giây còn lại thành dạng mm:ss, ví dụ 125 giây -> "02:05" (padStart thêm số 0 phía trước cho đủ 2 chữ số).
  const lockText = `${String(Math.floor(lockSeconds / 60)).padStart(2, "0")}:${String(lockSeconds % 60).padStart(2, "0")}`;

  // Đếm ngược mỗi giây, hết giờ thì tự mở lại nút đăng nhập
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setTimeout(() => setLockSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockSeconds]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi người dùng gõ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return; // đang bị khóa thì không gửi request nữa

    // 1. Validation cơ bản ở Frontend
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields!");
      return;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setError("Please enter your full name!");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters!");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    }

    // 2. Gọi API Spring Boot
    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        };

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // .catch(() => ({})): nếu server trả về không phải JSON (ví dụ trang lỗi HTML) thì dùng object rỗng để không bị crash.
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          // Backend gửi số giây phải chờ trong header Retry-After
          const wait = parseInt(res.headers.get("Retry-After"), 10);
          // Header thiếu hoặc không phải số thì mặc định chờ 15 phút (khớp với thời gian khóa ở backend).
          setLockSeconds(Number.isFinite(wait) && wait > 0 ? wait : 900);
        }
        setError(data.message || "Something went wrong. Please try again!");
        return;
      }

      // Lưu vào context + localStorage để Navbar cập nhật ngay
      login({
        id: data.user.id,
        email: data.user.email,
        name: data.user.fullName,
        role: data.user.role,
        token: data.token,
      });
      navigate(redirectTo, { state: redirectState }); // Về trang trước đó (hoặc trang chủ)
    } catch {
      setError(
        "Cannot connect to the server. Please check that the backend is running!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fadeIn">
        {/* Header Chuyển Đổi Tab */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              isLogin
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              !isLogin
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome back!" : "Create a new account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Enter your account details to continue"
              : "Sign up to get exclusive offers from our store"}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {(locked || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {locked
              ? `Too many failed attempts. Please try again in ${lockText}.`
              : error}
          </div>
        )}

        {/* Form Nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên (Chỉ hiện khi Sign up) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nhập lại mật khẩu (Chỉ hiện khi Sign up) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all"
                />
              </div>
            </div>
          )}

          {/* Quên mật khẩu (Chỉ hiện khi Sign in) */}
          {isLogin && (
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-black transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading || locked}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : locked
                ? `Try again in ${lockText}`
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
