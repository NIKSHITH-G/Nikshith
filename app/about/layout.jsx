export const metadata = {
  title: "About",
  description:
    "Nikshith G — Master's in AI at Monash, a year and a half building core banking systems at TCS. Experience, education, projects, and the stack I build with.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Nikshith G",
    description:
      "Master's in AI at Monash, ex-TCS. Experience, education, projects, and the stack I build with.",
    url: "https://nikshith.dev/about",
    type: "profile",
    images: ["/og.jpg"],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
