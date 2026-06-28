import { ImageResponse } from "next/og";

// Route segment config
export const alt = "Nikshith G — AI & Full-Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #0d0820 55%, #160628 100%)",
          color: "#ededed",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)",
          }}
        />

        {/* Top: terminal-style tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "26px",
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span style={{ color: "#86efac" }}>$</span>
          <span>whoami</span>
        </div>

        {/* Middle: name + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "92px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              backgroundImage: "linear-gradient(90deg, #818cf8, #c084fc)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Nikshith G
          </div>
          <div style={{ fontSize: "40px", color: "rgba(237,237,237,0.85)" }}>
            I build things, break things, fix things.
          </div>
        </div>

        {/* Bottom: role + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "26px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>AI & Full-Stack Engineer · Master's in AI @ Monash</span>
          <span style={{ color: "#a78bfa" }}>nikshith.online</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
