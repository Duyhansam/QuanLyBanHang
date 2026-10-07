import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function ShopHeader({ count, keyword, sortBy, setSortBy }) {
  return (
    <div className="my-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold uppercase font-archivo-black">
          {keyword
            ? `RESULTS FOR "${keyword.toUpperCase()}"`
            : "ALL BAREFOOT SHOES"}
          <sup className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded">
            {count}
          </sup>
        </h1>
        {!keyword && (
          <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-600">
            Discover all of our barefoot shoes across lifestyle, outdoor, and
            performance. Free your feet, feel more, and reconnect with your
            natural potential – however you love to move.
          </p>
        )}
      </div>

      {/* Filter / Sort */}
      <div className="flex items-center gap-3 text-xs font-bold">
        <button className="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 hover:border-black cursor-pointer">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          FILTER
        </button>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none cursor-pointer rounded border border-gray-300 bg-transparent py-2 pl-4 pr-9 text-xs font-bold uppercase outline-none hover:border-black"
          >
            <option value="default">SORT</option>
            <option value="price-asc">PRICE: LOW TO HIGH</option>
            <option value="price-desc">PRICE: HIGH TO LOW</option>
            <option value="name">NAME: A-Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
