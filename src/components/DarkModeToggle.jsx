import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

const DarkModeToggle = () => {
  const [dark, setDark] = useLocalStorage("darkMode", false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="text-xs bg-gray-300 px-2 py-1 rounded"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
};

export default DarkModeToggle;