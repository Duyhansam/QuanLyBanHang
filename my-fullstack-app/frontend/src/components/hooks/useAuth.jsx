import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Đọc payload của JWT để biết token còn hạn không (chỉ để đoán ở phía giao diện,
// backend vẫn là nơi kiểm tra thật)
function isTokenExpired(token) {
  try {
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

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: Boolean(user), login, logout }}
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
