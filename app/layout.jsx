import { Geist, Geist_Mono, DM_Mono, Instrument_Serif, Caveat, Silkscreen } from "next/font/google";
import "./globals.css";
import CommandPalette from "../components/CommandPalette";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});
// handwriting (whiteboard, letter) and pixel (arcade) faces for the studio
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const silkscreen = Silkscreen({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-silkscreen" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata = {
  metadataBase: new URL("https://nikshith.dev"),
  title: {
    default: "Nikshith G — AI & Full-Stack Engineer",
    template: "%s — Nikshith G",
  },
  description:
    "Master's in Artificial Intelligence at Monash. I build, break, and fix things — full-stack engineering, AI/ML, and everything in between.",
  keywords: [
    "Nikshith",
    "Nikshith G",
    "AI Engineer",
    "Full-Stack Developer",
    "Machine Learning",
    "Monash",
    "Portfolio",
  ],
  authors: [{ name: "Nikshith G", url: "https://github.com/NIKSHITH-G" }],
  openGraph: {
    title: "Nikshith G — AI & Full-Stack Engineer",
    description:
      "Master of AI at Monash, ex-TCS. Walk through my 3D studio, play my projects, and talk to an AI version of me.",
    url: "https://nikshith.dev",
    siteName: "Nikshith G",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Nikshith G — AI & Full-Stack Engineer. Walk through my 3D studio at nikshith.dev" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
    title: "Nikshith G — AI & Full-Stack Engineer",
    description: "Master of AI at Monash, ex-TCS. Walk through my 3D studio, play my projects, and talk to an AI version of me.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d16",
  colorScheme: "dark",
};

// Person structured data — helps Google build a rich "knowledge" result and
// links the profile to its social accounts.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nikshith G",
  url: "https://nikshith.dev",
  image: "https://nikshith.dev/opengraph-image",
  jobTitle: "AI & Full-Stack Engineer",
  alumniOf: { "@type": "CollegeOrUniversity", name: "Monash University" },
  worksFor: { "@type": "Organization", name: "Tata Consultancy Services" },
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Full-Stack Development",
  ],
  sameAs: [
    "https://github.com/NIKSHITH-G",
    "https://www.linkedin.com/in/nikshith-g-08368a246",
    "https://www.instagram.com/enigma_view/",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable} ${instrumentSerif.variable} ${caveat.variable} ${silkscreen.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        {children}
        <CommandPalette />
        <Analytics />
      </body>
    </html>
  );
}
