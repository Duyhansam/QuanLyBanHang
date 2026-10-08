import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export default function UserMenu() {
  const { user, isLoggedIn, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Bấm ra ngoài thì đóng menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CHƯA đăng nhập: giữ nguyên icon cũ, bấm vào đi tới trang login
  if (!isLoggedIn) {
    return (
      <Link
        to="/login"
        title="Sign in"
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <User className="w-5 h-5 text-neutral-700 hover:text-black" />
      </Link>
    );
  }

  // ĐÃ đăng nhập: vòng tròn chữ cái đầu + chấm xanh, bấm mở menu
  const initial = (user.name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("Logged out.");
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={user.name}
        className="relative w-9 h-9 flex items-center justify-center cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors">
          {initial}
        </span>
        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Signed in as
            </p>
            <p className="text-sm font-bold text-black truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
