import Hero from "../Body/HeroSection.jsx";
import Brand from "../Body/BrandSlider.jsx";
import CategoryCard from "../Body/CategoryCard.jsx";
import BestSeller from "../Body/BestSeller.jsx";
import BannerSales from "../Body/BannerSales.jsx";
import FeatureProducts from "../Body/FeaturesBar.jsx";

function Home({ wishlist, handleAddToWishlist, handleAddToCart }) {
  return (
    <>
      <Hero />
      <Brand />
      <CategoryCard />
      <BestSeller
        wishlist={wishlist}
        onToggleWishlist={handleAddToWishlist}
        onAddToCart={handleAddToCart}
      />
      <BannerSales />
      <FeatureProducts />
    </>
  );
}

export default Home;
