// A flat, front-on drawing of Nikshith's in-game character (hair, headphones,
// purple hoodie) — used wherever the site needs a face instead of a photo.
// `talking` makes the mouth move.
export default function BlockyAvatar({ size = 96, talking = false, className = "" }) {
  const u = size / 24; // the drawing is 24 × 24 units
  const box = (x, y, w, h, color, extra = {}) => ({
    position: "absolute",
    left: x * u,
    top: y * u,
    width: w * u,
    height: h * u,
    background: color,
    borderRadius: u * 0.8,
    ...extra,
  });
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size, background: "radial-gradient(circle at 50% 35%, #3b2f6b, #14121c 75%)" }}
      aria-hidden
    >
      {/* hoodie */}
      <div style={box(4, 18, 16, 8, "#7c5cd6", { borderRadius: `${u * 2.5}px ${u * 2.5}px 0 0` })} />
      <div style={box(9.5, 18, 5, 2, "#6a4cc2")} />
      {/* headphone band + cups */}
      <div style={box(5.2, 2.6, 13.6, 1.4, "#e5e7eb")} />
      <div style={box(4.4, 7, 2.2, 5.5, "#e5e7eb")} />
      <div style={box(17.4, 7, 2.2, 5.5, "#e5e7eb")} />
      {/* head */}
      <div style={box(6.2, 4.4, 11.6, 12.6, "#c89878", { borderRadius: u * 2 })} />
      {/* hair */}
      <div style={box(5.8, 3.6, 12.4, 3.6, "#1a1410", { borderRadius: `${u * 2}px ${u * 2}px ${u * 0.6}px ${u * 0.6}px` })} />
      <div style={box(12.2, 6.4, 5.4, 1.6, "#1a1410")} />
      {/* eyes */}
      <div style={box(9, 9.4, 1.6, 2, "#111", { borderRadius: u * 0.4 })} />
      <div style={box(13.4, 9.4, 1.6, 2, "#111", { borderRadius: u * 0.4 })} />
      {/* mouth */}
      <div
        style={box(10.4, 13.2, 3.2, 0.8, "#7c2d12", {
          borderRadius: u * 0.5,
          transformOrigin: "center top",
          animation: talking ? "avatar-talk 0.18s ease-in-out infinite alternate" : "none",
        })}
      />
    </div>
  );
}
