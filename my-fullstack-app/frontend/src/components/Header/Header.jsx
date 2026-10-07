import Topbanner from "./TopBanner";
import Navbar from "./Navbar";

function Header({ wishlistCount, cartCount }) {
  return (
    <header className=" w-full">
      <Topbanner />
      <Navbar wishlistCount={wishlistCount} cartCount={cartCount} />
    </header>
  );
}

export default Header;
