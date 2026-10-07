import { useFetch } from "../hooks/useFetch";

export default function BrandSlider() {
  const { data: brands } = useFetch("/api/brands");

  return (
    <section className="border border-gray-200 shadow-lg py-6 px-10 rounded-2xl bg-gray-100 flex items-center justify-between gap-6 mx-16 mt-4">
      <span className="text-xs font-bold tracking-wider text-black whitespace-nowrap">
        TOP BRANDS
      </span>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-hidden flex-nowrap py-1">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-center p-2 bg-white rounded-xl border border-neutral-200 shadow-sm  h-12 hover:border-black transition cursor-pointer w-full"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <span className="text-xs text-black font-bold cursor-pointer hover:underline whitespace-nowrap">
        View all
      </span>
    </section>
  );
}
