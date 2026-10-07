import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useNavbarSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Xử lý submit tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  // Đóng và xóa thanh tìm kiếm
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  // Ẩn/hiện thanh tìm kiếm
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return {
    isSearchOpen,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    closeSearch,
    toggleSearch,
  };
}
