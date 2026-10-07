import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch";

function HeroSection() {
  const { data: heroSlides } = useFetch("/api/home/hero-slides");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentIndex];
  if (!currentHero) return null;

  return (
    <div className="bg-gray-100 rounded-3xl p-12 mr-15  flex items-center justify-between gap-8 relative overflow-hidden">
      <section className="flex flex-col gap-4 w-1/2 lead">
        <span className="text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
          {currentHero.title}
        </span>
        <p className="text-neutral-600 text-base max-w-md">
          {currentHero.description}
        </p>
        <div className="flex gap-4 mt-2">
          <button className="bg-black text-white px-7 py-3.5 rounded-xl font-medium hover:bg-neutral-800 transition flex items-center">
            Shop Now <ArrowRight className="ml-2 w-4 h-4" />
          </button>
          <button className="bg-transparent text-neutral-900 px-7 py-3.5 rounded-xl font-medium border border-neutral-400 hover:bg-neutral-200 transition">
            Explore Brands
          </button>
        </div>
      </section>

      <div className="flex-1 flex justify-center">
        <div className="relative w-[450px] h-[350px] flex items-center justify-center">
          <img
            src={currentHero.image}
            alt={currentHero.title}
            className="w-full max-w-md object-contain drop-shadow-xl"
          />
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-neutral-200 flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-900">
              {currentHero.badgeTitle}
            </span>
            <span className="text-xs text-neutral-500">
              {currentHero.badgeSub}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "w-8 bg-black"
                : "bg-neutral-400 w-2.5 hover:bg-neutral-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
