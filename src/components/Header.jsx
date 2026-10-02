import { useTheme } from "../context/ThemeContext.jsx";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`header theme-${theme}`}>
      <div className="header-inner">
        <div>
          <h1>HelpDesk</h1>
          <p className="subtitle">Student Assistance Queue</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={toggleTheme}>
          Switch to {theme === "light" ? "dark" : "light"} theme
        </button>
      </div>
    </header>
  );
}
