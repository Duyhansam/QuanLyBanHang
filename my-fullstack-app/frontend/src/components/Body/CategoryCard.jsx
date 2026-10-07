import { useFetch } from "../hooks/useFetch";

export default function CategoryCard() {
  const { data: categories } = useFetch("/api/home/categories");

  return (
    <section className="mx-16 mt-8 flex flex-col gap-4">
      <h3 className="text-xs font-bold tracking-wider text-black">
        SHOP BY CATEGORY
      </h3>

      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 flex-nowrap py-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-center justify-between p-4 bg-gray-50 rounded-2xl border border-neutral-200 shadow-sm hover:border-black transition cursor-pointer flex-1 min-w-0 h-28 sm:h-32 group"
          >
            <div className="w-full h-20 flex items-center justify-center">
              <img
                src={cat.image}
                alt={cat.name}
                className="max-h-full object-contain group-hover:scale-105 transition duration-300"
              />
            </div>
            <span className="text-xs font-semibold text-neutral-800 mt-2">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
