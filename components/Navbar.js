export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 
                 bg-background/90 backdrop-blur-sm shadow-md z-50"
    >
      {/* Logo */}
      <h1 className="text-2xl font-bold text-foreground">Nikshith</h1>

      {/* Center Links */}
      <div className="flex gap-6 text-foreground/90">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  );
}
