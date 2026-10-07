import { useWishList } from "./components/hooks/useWithList.jsx";
import { useListCart } from "./components/hooks/useListCart.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer.jsx";
import Home from "./components/pages/Home.jsx";
import Shop from "./components/pages/Shop/Shop.jsx";
import WishListPage from "./components/pages/TitlePage/WishlistPage.jsx";
import CartPage from "./components/pages/TitlePage/CartPage.jsx";
import Men from "./components/pages/Men/Men.jsx";
import Women from "./components/pages/Women/Women.jsx";
import Kid from "./components/pages/Kid/Kid.jsx";
import Brands from "./components/pages/Brands/Brands.jsx";
import Sale from "./components/pages/Sale/Sale.jsx";
import CheckoutPage from "./components/pages/CheckoutPage.jsx";
import ProductDetailWrapper from "./components/pages/ProductDetail/ProductDetailWrapper.jsx";
import ScrollToTop from "./components/OptimizeUI/ScrollToTop.jsx";
import { Toaster } from "react-hot-toast";
import AuthPage from "./components/pages/AuthPage.jsx";
import { CompareProvider } from "./components/hooks/useCompare.jsx";
import ComparePage from "./components/pages/Compare/ComparePage.jsx";
import CompareBar from "./components/pages/Compare/CompareBar.jsx";
function App() {
  // 1. Sử dụng custom hook useWishList để quản lý wishlist
  const { wishlist, handleToggleWishlist, wishlistCount } = useWishList();

  // 2. Sử dụng custom hook useListCart để quản lý giỏ hàng
  const {
    cart,
    handleAddToCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveFromCart,
    handleClearCart,
    cartCount,
  } = useListCart();

  // Tính số lượng hiển thị trên icon Navbar
  return (
    <Router>
      <CompareProvider>
        <ScrollToTop />
        <Toaster position="top-right" reverseOrder={false} />
        <div className="min-h-screen flex flex-col justify-between">
          <header className="sticky top-0 z-50">
            <Header wishlistCount={wishlistCount} cartCount={cartCount} />
          </header>{" "}
          <div>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    handleAddToCart={handleAddToCart}
                  />
                }
              />
              <Route
                path="/shop"
                element={
                  <Shop
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    cart={cart}
                    handleAddToCart={handleAddToCart}
                  />
                }
              />
              <Route
                path="/men"
                element={
                  <Men
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    handleAddToCart={handleAddToCart}
                    cart={cart}
                  />
                }
              />
              <Route
                path="/women"
                element={
                  <Women
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    handleAddToCart={handleAddToCart}
                  />
                }
              />
              <Route
                path="/kids"
                element={
                  <Kid
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    handleAddToCart={handleAddToCart}
                  />
                }
              />
              <Route path="/brands" element={<Brands />} />
              <Route
                path="/sale"
                element={
                  <Sale
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    handleAddToCart={handleAddToCart}
                  />
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProductDetailWrapper
                    wishlist={wishlist}
                    handleAddToWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                  />
                }
              />
              <Route
                path="/wishlist"
                element={
                  <WishListPage
                    wishlist={wishlist}
                    onAddToCart={handleAddToCart}
                    handleAddToWishlist={handleToggleWishlist}
                  />
                }
              />
              <Route
                path="/cart"
                element={
                  <CartPage
                    cart={cart}
                    onRemove={handleRemoveFromCart}
                    onIncrease={handleIncreaseQuantity}
                    onDecrease={handleDecreaseQuantity}
                  />
                }
              />
              <Route
                path="/checkout"
                element={
                  <CheckoutPage cart={cart} onClearCart={handleClearCart} />
                }
              />
              <Route
                path="/compare"
                element={<ComparePage onAddToCart={handleAddToCart} />}
              />
              <Route path="/login" element={<AuthPage />} />{" "}
            </Routes>
          </div>
          <Footer />
          <CompareBar />
        </div>
      </CompareProvider>
    </Router>
  );
}

export default App;
