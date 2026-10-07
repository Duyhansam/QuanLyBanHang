import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // true: Đăng nhập, false: Đăng ký
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi người dùng gõ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation cơ bản ở Frontend
    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        setError("Vui lòng nhập họ và tên!");
        return;
      }
      if (formData.password.length < 8) {
        setError("Mật khẩu phải có ít nhất 8 ký tự!");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không trùng khớp!");
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Có lỗi xảy ra, vui lòng thử lại!");
        return;
      }

      // Lưu theo đúng dạng cũ { email, name, token } + thêm id, role
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role,
          token: data.token,
        }),
      );
      navigate("/"); // Chuyển về trang chủ sau khi thành công
    } catch {
      setError(
        "Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa!",
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
            Đăng nhập
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
            Đăng ký
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Nhập thông tin tài khoản của bạn để tiếp tục"
              : "Đăng ký để nhận nhiều ưu đãi từ cửa hàng"}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form Nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên (Chỉ hiện khi Đăng ký) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
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

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mật khẩu
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

          {/* Nhập lại mật khẩu (Chỉ hiện khi Đăng ký) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Xác nhận mật khẩu
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

          {/* Quên mật khẩu (Chỉ hiện khi Đăng nhập) */}
          {isLogin && (
            <div className="flex justify-end">
              <a
                href="#"
                className="text-xs text-gray-500 hover:text-black transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Đang xử lý..."
              : isLogin
                ? "Đăng nhập"
                : "Tạo tài khoản"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
