import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

// Component
import IconsNavbar from "./IconsNavbar";
import IconButton from "./IconButton";

function Buttons() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "dark" ? "Ganti ke light mode" : "Ganti ke dark mode";

  return (
    <div className="flex items-center gap-2">

      <button
        type="button"
        onClick={toggleLanguage}
        className="
          h-9 min-w-11
          rounded-full
          border border-zinc-700
          px-3
          text-xs font-bold uppercase tracking-wider
          text-zinc-300
          transition
          hover:border-zinc-500 hover:bg-zinc-800 hover:text-white
        "
      >
        {language === "id" ? "ID" : "EN"}
      </button>
    </div>
  );
}

export default Buttons;
