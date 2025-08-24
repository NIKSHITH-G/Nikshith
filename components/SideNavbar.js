"use client";
import { useState, useEffect } from "react";

export default function SideNavbar() {
  const sections = ["about", "experience", "devices", "projects", "tools"];
  const [active, setActive] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      let current = "about";

      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPos + 200) {
          current = section;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4 bg-background/80 dark:bg-background/70 p-3 rounded-lg shadow-lg">
      {sections.map((section) => (
        <a
          key={section}
          href={`#${section}`}
          className={`px-3 py-2 rounded-full text-foreground text-sm cursor-pointer transition-all ${
            active === section ? "bg-blue-500 scale-110 text-white" : "hover:bg-foreground/20"
          }`}
        >
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </a>
      ))}
    </nav>
  );
}
