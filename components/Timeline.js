"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function Timeline({ milestones }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  // Smooth dot position
  const dotTop = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;

      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let currentIndex = 0;
      milestones.forEach((_, i) => {
        const milestoneEl = containerRef.current.children[i + 1]; // +1 because first child is the line
        const milestoneTop = milestoneEl.offsetTop + containerTop + milestoneEl.offsetHeight / 2;
        if (scrollMiddle >= milestoneTop - 50) {
          currentIndex = i;
        }
      });

      setActiveIndex(currentIndex);

      // Smooth dot animation: top in px relative to container
      const progress = currentIndex / (milestones.length - 1);
      dotTop.set(progress * containerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dotTop, milestones]);

  return (
    <div className="flex w-full max-w-6xl">
      {/* Timeline */}
      <div ref={containerRef} className="relative flex flex-col items-center w-1/2 py-12">
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-foreground/30 dark:bg-foreground/20"></div>

        {/* Floating Active Dot */}
        <motion.div
          className="absolute w-5 h-5 rounded-full bg-blue-500 shadow-lg"
          style={{
            top: dotTop,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* Milestones */}
        {milestones.map((m, i) => (
          <div
            key={i}
            className="milestone relative mb-24 flex flex-col items-center text-center"
          >
            <div className="w-4 h-4 rounded-full bg-foreground mb-4"></div>
            <h3 className="font-bold text-lg">{m.title}</h3>
            <p className="text-sm text-foreground/70">{m.year}</p>
          </div>
        ))}
      </div>

      {/* Image Display */}
      <div className="w-1/2 flex justify-center items-center">
        <img
          src={milestones[activeIndex].image}
          alt={milestones[activeIndex].title}
          className="w-80 h-80 object-cover rounded-lg shadow-xl transition-all duration-500"
        />
      </div>
    </div>
  );
}
