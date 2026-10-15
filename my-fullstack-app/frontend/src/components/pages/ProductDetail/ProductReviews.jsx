import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../hooks/userApi";

// Hàng 5 ngôi sao (chỉ để hiển thị)
function Stars({ value, className = "w-4 h-4" }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${
            n <= Math.round(value)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ productId }) {
  const { user, isLoggedIn } = useAuth();
  const token = user?.token ?? null;

  const [summary, setSummary] = useState({ average: 0, count: 0, reviews: [] });
  const [mine, setMine] = useState({ canReview: false, review: null });
  const [loading, setLoading] = useState(true);

  // Form viết / sửa đánh giá
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSummary = useCallback(
    () =>
      fetch(`/api/reviews/product/${productId}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(setSummary)
        .catch(() => {})
        .finally(() => setLoading(false)),
    [productId],
  );

  const loadMine = useCallback(() => {
    if (!token) {
      setMine({ canReview: false, review: null });
      return Promise.resolve();
    }
    return apiFetch(`/api/reviews/mine?productId=${productId}`, token)
      .then((m) => {
        setMine(m);
        setRating(m.review?.rating ?? 0);
        setComment(m.review?.comment ?? "");
      })
      .catch(() => {}); // token hết hạn... thì coi như chưa đăng nhập, không làm phiền người xem
  }, [productId, token]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", token, {
        method: "POST",
        body: JSON.stringify({ productId, rating, comment }),
      });
      toast.success(
        mine.review ? "Review updated!" : "Thanks for your review!",
      );
      await Promise.all([loadSummary(), loadMine()]);
    } catch (err) {
      toast.error(err.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiFetch(`/api/reviews/${id}`, token, { method: "DELETE" });
      toast.success("Review deleted.");
      await Promise.all([loadSummary(), loadMine()]);
    } catch (err) {
      toast.error(err.message || "Could not delete the review.");
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-xl font-extrabold uppercase text-black mb-6">
        Customer reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cột trái: điểm trung bình + form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-extrabold text-black">
              {summary.count > 0 ? summary.average.toFixed(1) : "–"}
            </span>
            <div>
              <Stars value={summary.average} className="w-5 h-5" />
              <p className="text-xs text-gray-500 mt-1">
                {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {!isLoggedIn ? (
            <p className="text-sm text-gray-600">
              <Link
                to="/login"
                state={{ from: `/product/${productId}` }}
                className="font-bold underline hover:text-black"
              >
                Sign in
              </Link>{" "}
              to write a review.
            </p>
          ) : !mine.canReview ? (
            <p className="text-sm text-gray-500">
              You can review this product after your order has been delivered.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-bold uppercase text-black">
                {mine.review ? "Edit your review" : "Write a review"}
              </p>
              <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    className="cursor-pointer p-0.5"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= (hover || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product (optional)"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : mine.review
                    ? "Update review"
                    : "Submit review"}
              </button>
            </form>
          )}
        </div>

        {/* Cột phải: danh sách đánh giá */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading reviews...</p>
          ) : summary.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {summary.reviews.map((r) => (
                <li key={r.id} className="py-5 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Stars value={r.rating} />
                        <span className="text-sm font-bold text-black">
                          {r.userName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-US")
                          : ""}
                      </p>
                    </div>
                    {(isAdmin || r.userId === user?.id) && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        title="Delete review"
                        className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
