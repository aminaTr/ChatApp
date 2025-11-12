// components/ThemeDropdown.jsx
import { useState, useEffect } from "react";

// themes: light --default, dark --prefersdark, forest, synthwave, retro,
//   garden, dracula, coffee, cupcake;

const themes = [
  "default",
  "dark",
  "forest",
  "synthwave",
  "retro",
  "garden",
  "dracula",
  "coffee",
  "cupcake",
];

export default function ThemeController() {
  const [activeTheme, setActiveTheme] = useState("default");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme && themes.includes(storedTheme)) {
      setActiveTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "default");
    }
  }, []);

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div className="dropdown ">
      <div tabIndex={0} role="button" className="btn m-1">
        Theme
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>

      <ul
        tabIndex="-1"
        className="dropdown-content bg-base-300 rounded-box z-50 w-52 p-2 shadow-2xl"
      >
        {themes.map((theme) => (
          <li key={theme}>
            <button
              className={`w-full btn btn-sm btn-block btn-ghost justify-start ${
                activeTheme === theme ? "bg-primary text-white" : ""
              }`}
              onClick={() => handleThemeChange(theme)}
              aria-label={theme}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
