import { ArrowRight } from "lucide-react";
import { useFetch } from "../hooks/useFetch";

export default function BannerSales() {
  const { data: banner, error } = useFetch("/api/home/banner");

  // Chưa tải xong (data còn là []) hoặc backend không có banner nào đang bật
  if (error || !banner || Array.isArray(banner)) return null;

  return (
    <section className="relative mx-16 mt-16 rounded-3xl bg-[#09090b] text-white flex flex-col md:flex-row items-stretch justify-between overflow-hidden">
      <div className="flex flex-col items-start z-10 py-10 px-8 md:py-14 md:px-12 w-full md:w-[35%] shrink-0 justify-center">
        <span className="text-xs font-semibold text-orange-300 tracking-wider mb-2 uppercase">
          {banner.label}
        </span>
        <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
          {banner.title}
        </h3>
        <p className="text-sm text-neutral-300 mb-6">{banner.description}</p>
        <button className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer">
          {banner.buttonText}
          <ArrowRight size={16} />
        </button>
      </div>

      <div
        className="w-full md:w-[65%] min-h-[260px] md:min-h-[300px] bg-no-repeat bg-right bg-contain"
        style={{ backgroundImage: `url(${banner.image})` }}
      />
    </section>
  );
}
