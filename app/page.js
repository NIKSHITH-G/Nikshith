"use client";

import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    // Dynamically import Anime.js from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js";
    script.onload = () => {
      if (window.anime && heroRef.current) {
        const anime = window.anime;

        // Timeline for headline and paragraph
        anime.timeline({ easing: "easeOutExpo", duration: 1000 })
          .add({
            targets: ".hero-headline",
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 200,
          })
          .add({
            targets: ".hero-paragraph",
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 100,
          });

        // Waving emoji animation
        anime({
          targets: ".wave-emoji",
          rotate: [0, 20, -20, 20, -20, 0],
          duration: 2000,
          loop: true,
          easing: "easeInOutSine",
          delay: 500,
        });
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section
        ref={heroRef}
        className="flex flex-col items-center justify-center min-h-screen text-center px-6"
      >
        <h2 className="hero-headline text-5xl font-bold mb-4">
          Hello, I'm Nikshith <span className="wave-emoji inline-block">👋</span>
        </h2>
        <p className="hero-paragraph text-lg max-w-xl mb-6">
          Welcome to my portfolio! I'm a developer passionate about building
          interactive, engaging, and beautiful web experiences.
        </p>
        <a
          href="/about"
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Learn More About Me
        </a>
      </section>
    </main>
  );
}
