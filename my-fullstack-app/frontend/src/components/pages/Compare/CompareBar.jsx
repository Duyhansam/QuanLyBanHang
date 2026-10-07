import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useCompare, MAX_COMPARE } from "../../hooks/useCompare";

// Thanh nổi ở đáy màn hình, hiện khi có sản phẩm trong danh sách so sánh
export default function CompareBar() {
  const { compareList, handleRemoveCompare, handleClearCompare } = useCompare();
  const { pathname } = useLocation();

  if (compareList.length === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Compare ({compareList.length}/{MAX_COMPARE})
          </span>
          {compareList.map((p) => (
            <div
              key={p.id}
              className="relative w-14 h-14 bg-[#f4f4f4] rounded overflow-hidden"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-contain p-1"
              />
              <button
                onClick={() => handleRemoveCompare(p.id)}
                className="absolute top-0 right-0 w-4 h-4 bg-black text-white flex items-center justify-center cursor-pointer"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCompare}
            className="text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black cursor-pointer"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className={`text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded transition-colors shadow-sm ${
              compareList.length < 2
                ? "bg-gray-300 text-white pointer-events-none"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
