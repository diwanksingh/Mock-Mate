import { useEffect,useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { LogoContainer } from "./logo-container";
import { NavLink } from "react-router-dom";
import { ProfileContainer } from "./profile-container";
import { Moon, Phone, Sun } from "lucide-react";
import { Home } from "lucide-react";

const Header = () => {
  const { userId } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

useEffect(() => {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    html.classList.add("dark");
    setTheme("dark");
  } else {
    html.classList.remove("dark");
    setTheme("light");
  }

  const toggleButton = document.getElementById("toggle-theme");
  if (!toggleButton) return;

  const toggleDarkMode = () => {
    const isDark = html.classList.toggle("dark");
    const newTheme = isDark ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  toggleButton.addEventListener("click", toggleDarkMode);

  return () => {
    toggleButton.removeEventListener("click", toggleDarkMode);
  };
}, []);



  return (
    <header
      className={cn(
        "w-full mt-3 sm:w-[90%] md:w-3/4 lg:w-1/2 mx-auto",
        "border bg-gray-100 dark:bg-black dark:border-gray-600",
        "rounded-full shadow-sm px-4 py-2 transition-all duration-200 ease-in-out"
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        {/* Logo and Branding */}
        <div className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-white tracking-tight">
          <LogoContainer />
          <span className="hidden sm:inline-block">MOCK-MATE</span>
        </div>

        {/* Navigation and Actions */}
        <div className="flex flex-row items-center gap-2">
        <button
        id="toggle-theme"
        className="px-3 py-1 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-500 dark:text-white flex items-center 
        hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-lg gap-2"
        >
       {theme === "dark" ? (
      <Sun className="h-5 w-5 text-yellow-400" />
       ) : (
       <Moon className="h-5 w-5 text-gray-600" />
      )}
      </button>
       {userId && (
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-xs font-medium px-3 py-1 rounded-full border border-gray-300 shadow-sm",
                  "hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-lg",
                  isActive && "bg-gray-300 text-gray-900 shadow-lg font-semibold dark:bg-gray-700 dark:text-white"
                )
              }
            >
              <Home className="h-4 w-4" />
            </NavLink>
          )}

          {userId && (
            <NavLink
              to="/generate"
              className={({ isActive }) =>
                cn(
                  "text-xs font-medium px-3 py-1 rounded-full border border-gray-300 shadow-sm",
                "hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-lg",
                  isActive && "bg-gray-300 text-gray-900  dark:bg-gray-700 dark:text-white"
                )
              }
            >
              Interviews
            </NavLink>
          )}
             {userId && (
            <NavLink
              to="/contact-me"
              className={({ isActive }) =>
                cn(
                  "text-xs font-medium px-3 py-1 rounded-full border border-gray-300 shadow-sm",
                "hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-lg",
                  isActive && "bg-gray-300 text-gray-900  dark:bg-gray-700 dark:text-white"
                )
              }
            >
              <Phone className="h-4 w-4" />
            </NavLink>
          )}

          <ProfileContainer />
        </div>
      </div>
    </header>
  );
};

export default Header;
