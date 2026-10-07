import { useState } from "react";
import { ShoppingCart, User, Heart, Search, X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import navItems from "./NavItem.js";

import useNavbarSearch from "../hooks/useNavbarSearch.js";

function Navbar({ wishlistCount, cartCount }) {
  // State quản lý Mega Menu (giữ lại ở UI vì nó thuộc về giao diện)
  const [activeMenu, setActiveMenu] = useState(null);

  // Gọi logic tìm kiếm từ hook
  const {
    isSearchOpen,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    closeSearch,
    toggleSearch,
  } = useNavbarSearch();

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center px-8 m-4">
        <Link to="/">
          <Logo />
        </Link>

        {/* Khu vực trung tâm: Menu hoặc Tìm kiếm */}
        <div className="flex-1 flex justify-center px-12 transition-all duration-300">
          <div className="w-full max-w-xl flex justify-center items-center">
            {!isSearchOpen ? (
              <div
                className="flex gap-8 items-center animate-fadeIn"
                onMouseLeave={() => setActiveMenu(null)}
              >
                {navItems.map((item) => {
                  if (!item.hasMegaMenu) {
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onMouseEnter={() => setActiveMenu(null)}
                        className={({ isActive }) =>
                          `font-semibold text-sm relative pb-2 transition-colors inline-block ${
                            item.isSale
                              ? isActive
                                ? "text-red-600 border-b-2 border-red-600"
                                : "text-red-400 hover:text-red-800"
                              : isActive
                                ? "text-black border-b-2 border-black"
                                : "text-gray-600 hover:text-black"
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    );
                  }

                  return (
                    <div
                      key={item.name}
                      className="py-2"
                      onMouseEnter={() => setActiveMenu(item.name)}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `font-semibold text-sm relative pb-2 transition-colors inline-block ${
                            item.isSale
                              ? isActive || activeMenu === item.name
                                ? "text-red-600 border-b-2 border-red-600"
                                : "text-red-400 hover:text-red-800"
                              : isActive || activeMenu === item.name
                                ? "text-black border-b-2 border-black"
                                : "text-gray-600 hover:text-black"
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Hiển thị thanh tìm kiếm khi isSearchOpen là true
              <form
                onSubmit={handleSearchSubmit}
                className="w-full flex items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-300 animate-fadeIn"
              >
                <button type="submit" className="flex items-center">
                  <Search className="w-4 h-4 text-gray-500 mr-2 hover:text-black cursor-pointer" />
                </button>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products, brands..."
                  autoFocus
                  className="w-full bg-transparent text-sm outline-none text-black placeholder-gray-500"
                />
                <X
                  className="w-5 h-5 text-gray-500 cursor-pointer hover:text-black ml-2"
                  onClick={closeSearch}
                />
              </form>
            )}
          </div>
        </div>

        {/* Các icon bên phải */}
        <div className="flex items-center gap-4">
          <Search
            className="w-5 h-5 text-neutral-700 cursor-pointer hover:text-black"
            onClick={toggleSearch}
          />
          <Link
            to="/wishlist"
            className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-700" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-neutral-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <User className="w-5 h-5 text-neutral-700  hover:text-black" />
          </Link>
        </div>
      </div>

      {/* Mega menu */}
      {navItems.map((item) =>
        item.hasMegaMenu && activeMenu === item.name ? (
          <div
            key={item.name}
            className="absolute left-0 right-0 top-full pt-3 z-50"
            onMouseEnter={() => setActiveMenu(item.name)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="max-w-6xl mx-auto bg-white text-neutral-900 shadow-2xl border border-gray-200 rounded-2xl pb-12 pt-8 animate-fadeIn">
              <div className="px-8">
                <div className="grid grid-cols-3 gap-12">
                  {item.columns.map((col, idx) => (
                    <div key={idx} className="flex flex-col space-y-3">
                      <h3 className="font-bold text-xs tracking-wider text-gray-400 uppercase">
                        {col.title}
                      </h3>
                      {col.links.map((link, linkIdx) => (
                        <a
                          key={linkIdx}
                          href={item.path}
                          className="text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

export default Navbar;
