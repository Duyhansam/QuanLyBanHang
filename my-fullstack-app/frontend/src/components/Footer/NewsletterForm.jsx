import { useState } from "react";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  // State để lưu email và trạng thái loading
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      if (res.status === 400) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      toast.success("Thanks for subscribing!");
      setEmail("");
    } catch {
      toast.error("Cannot reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 relative flex items-center">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-label="Email address"
        autoComplete="email"
        className="bg-[#1f2022] p-4 pr-14 rounded-lg w-full text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-300"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Subscribe"
        className="bg-[#2a2b2d] p-2.5 cursor-pointer absolute right-2.5 text-gray-400 hover:text-white transition rounded-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ArrowRight size={20} />
      </button>
    </form>
  );
}
