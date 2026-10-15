import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Đọc payload của JWT để biết token còn hạn không (chỉ để đoán ở phía giao diện,
// backend vẫn là nơi kiểm tra thật)
function isTokenExpired(token) {
  try {
    // JWT gồm 3 phần ngăn bằng dấu chấm: header.payload.signature. Payload là JSON mã hóa base64url
    // (dùng - và _ thay cho + và /) nên phải đổi về base64 thường thì atob() mới giải mã được.
    // exp là thời điểm hết hạn tính bằng GIÂY, nhân 1000 để so với Date.now() (mili giây).
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return true; // token hỏng => coi như hết hạn
  }
}

function loadUser() {
  try {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (!saved?.token || isTokenExpired(saved.token)) {
      localStorage.removeItem("user"); // xóa luôn dữ liệu mock/hết hạn
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Truyền loadUser (không có dấu ngoặc) để React chỉ đọc localStorage MỘT lần lúc khởi tạo (lazy initial state)
  const [user, setUser] = useState(loadUser);

  // Gọi sau khi đăng nhập / đăng ký thành công
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Cập nhật một phần thông tin user đang đăng nhập (ví dụ đổi họ tên ở trang hồ sơ)
  const updateUser = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: Boolean(user), login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
