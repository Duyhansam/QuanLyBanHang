import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Something went wrong. Please try again!");
        return;
      }
      setSent(true);
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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email and we'll send you a link to reset your
            password.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl text-center">
            If this email is registered, you will receive instructions to reset
            your password. The link is valid for 30 minutes.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Send reset link"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
