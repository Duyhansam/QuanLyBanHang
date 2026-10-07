import { SlidersHorizontal, ChevronDown } from "lucide-react";

const tabs = [
  "ALL SHOES",
  "BEST SELLERS",
  "OUTDOOR",
  "EVERYDAY",
  "PERFORMANCE",
];

export default function MenHeader({
  count,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
}) {
  return (
    <div>
      <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold uppercase font-archivo-black">
        MEN'S SHOES
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded">
          {count}
        </span>
      </h1>

      <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-600">
        City commutes. Forest hikes. Park runs. School runs. Whatever the
        challenge, our men's barefoot shoes let your feet move with strength,
        stability and freedom.
      </p>

      <div className="my-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium uppercase cursor-pointer ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter / Sort */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <button className="flex items-center gap-2 rounded px-4 py-2 cursor-pointer">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTER
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none cursor-pointer rounded bg-transparent py-2 pl-4 pr-8 text-xs font-bold uppercase outline-none"
            >
              <option value="default">SORT</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
              <option value="name">NAME: A-Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
