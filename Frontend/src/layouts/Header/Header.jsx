import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Header.css";

const Header = ({ onToggleSidebar }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const headerRef = useRef(null);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = () => {
    // Here you can add search logic in the future
    // For now, just close the search bar
    handleSearchClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        handleSearchClose();
      }
    };

    // Only add listener if search is open
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSearchOpen]);

  return (
    <header ref={headerRef}>
      <div className="header-left">
        <button
          className="hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          &#9776;
        </button>

        <div className="logo">
          {/* <Link to="/">ABCD</Link> */}
          <Link to="/">A</Link>
        </div>
      </div>

      <div className="header-right">
        <div
          className={`search-container ${isSearchOpen ? "search-open" : ""}`}
          id="searchBox"
          role="search"
        >
          <input
            type="text"
            placeholder="Search the application..."
            aria-label="Search the application"
            onBlur={handleSearchClose}
            onKeyPress={handleKeyPress}
            autoFocus={isSearchOpen}
          />

          <div className="search-icon-container">
            <button
              type="button"
              id="searchToggle"
              className="material-icons search-icon"
              aria-label="Search"
              onClick={handleSearchSubmit}
            >
              search
            </button>
          </div>
        </div>

        <button
          type="button"
          className="material-icons search-icon-out"
          onClick={handleSearchToggle}
          aria-label="Toggle search"
          aria-expanded={isSearchOpen}
        >
          search
        </button>
      </div>
    </header>
  );
};

export default Header;
