import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../hooks/userApi";

const inputCls =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all disabled:opacity-60 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const token = user?.token ?? null;

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Token hết hạn / sai thì đăng xuất để người dùng đăng nhập lại
  const handleAuthError = (err) => {
    if (err?.status === 401) {
      logout();
      toast.error("Your session has expired. Please sign in again.");
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiFetch("/api/v1/auth/me", token)
      .then((me) => {
        if (cancelled) return;
        setProfile({
          fullName: me.fullName ?? "",
          email: me.email ?? "",
          phone: me.phone ?? "",
          address: me.address ?? "",
          city: me.city ?? "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (!handleAuthError(err)) toast.error(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: "/profile" }} replace />;
  }

  const handleProfileChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      toast.error("Please enter your full name!");
      return;
    }
    setSaving(true);
    try {
      const me = await apiFetch("/api/v1/auth/me", token, {
        method: "PUT",
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
        }),
      });
      updateUser({ name: me.fullName }); // để menu trên cùng đổi tên ngay
      toast.success("Profile saved!");
    } catch (err) {
      if (!handleAuthError(err)) toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) =>
    setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.next) {
      toast.error("Please fill in all fields!");
      return;
    }
    if (pw.next.length < 8) {
      toast.error("New password must be at least 8 characters!");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    setChangingPw(true);
    try {
      await apiFetch("/api/v1/auth/password", token, {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
      });
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      if (!handleAuthError(err)) toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">My profile</h1>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black"
            >
              <Package className="w-4 h-4" /> Orders
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls}
                  value={profile.email}
                  disabled
                  readOnly
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Your email is your sign-in name, so it cannot be changed.
                </p>
              </div>
              <div>
                <label className={labelCls}>Full name *</label>
                <input
                  className={inputCls}
                  name="fullName"
                  maxLength={100}
                  value={profile.fullName}
                  onChange={handleProfileChange}
                />
              </div>
              <div>
                <label className={labelCls}>Phone number</label>
                <input
                  className={inputCls}
                  name="phone"
                  maxLength={20}
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="0912 345 678"
                />
              </div>
              <div>
                <label className={labelCls}>Shipping address</label>
                <input
                  className={inputCls}
                  name="address"
                  maxLength={255}
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className={labelCls}>City / Province</label>
                <input
                  className={inputCls}
                  name="city"
                  maxLength={100}
                  value={profile.city}
                  onChange={handleProfileChange}
                  placeholder="Hanoi"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          )}
        </div>

        {/* Change password */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Change password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelCls}>Current password</label>
              <input
                className={inputCls}
                type={showPw ? "text" : "password"}
                name="current"
                autoComplete="current-password"
                value={pw.current}
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <label className={labelCls}>New password</label>
              <input
                className={inputCls}
                type={showPw ? "text" : "password"}
                name="next"
                autoComplete="new-password"
                value={pw.next}
                onChange={handlePasswordChange}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className={labelCls}>Confirm new password</label>
              <input
                className={inputCls}
                type={showPw ? "text" : "password"}
                name="confirm"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={handlePasswordChange}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black cursor-pointer"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showPw ? "Hide password" : "Show password"}
            </button>
            <button
              type="submit"
              disabled={changingPw}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {changingPw ? "Processing..." : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
