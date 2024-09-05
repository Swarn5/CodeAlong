import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleClick = (link: string) => {
    setActiveLink(link);
    // Close the menu when a link is clicked (optional)
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className=" z-50 bg-white shadow-xl">
      <header className="md:px-24 px-8 flex flex-wrap items-center py-6 bg-white">
        <div className="flex-1 flex items-center lg:justify-between md:justify-between justify-center">
          <a href="#" className="text-3xl font-serif text-bold text-black">
            CodeAlong
          </a>
        </div>

        <label
          htmlFor="menu-toggle"
          className="pointer-cursor md:hidden block"
          onClick={toggleMenu} // Toggle menu on label click
        >
          <svg
            className="fill-current text-gray-900"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <title>menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
          </svg>
        </label>

        <input
          className="hidden"
          type="checkbox"
          id="menu-toggle"
          checked={menuOpen}
          onChange={() => {}}
        />

        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } md:flex md:items-center md:w-auto w-full`}
          id="menu"
        >
          <nav>
            <ul className="md:flex items-center justify-between text-base text-gray-700 pt-4 md:pt-0">
              <li>
                <a
                  className={`md:p-4 py-3 px-0 block cursor-pointer ${
                    activeLink === "about"
                      ? "text-violet-600 font-semibold"
                      : ""
                  }`}
                  onClick={() => handleClick("about")}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className={`md:p-4 py-3 px-0 block cursor-pointer ${
                    activeLink === "treatments"
                      ? "text-violet-600 font-semibold"
                      : ""
                  }`}
                  onClick={() => handleClick("treatments")}
                >
                  Treatments
                </a>
              </li>
              <li>
                <a
                  className={`md:p-4 py-3 px-0 block cursor-pointer ${
                    activeLink === "blog" ? "text-violet-600 font-semibold" : ""
                  }`}
                  onClick={() => handleClick("blog")}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  className={`md:p-4 py-3 px-0 block md:mb-0 mb-2 cursor-pointer ${
                    activeLink === "contact"
                      ? "text-violet-600 font-semibold"
                      : ""
                  }`}
                  onClick={() => handleClick("contact")}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
