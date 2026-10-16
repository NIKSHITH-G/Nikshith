// Single source of truth for everything the site says. The 3D studio panels
// and the classic /about page both render from this file, so edit it here.

export const profile = {
  name: "Nikshith G",
  role: "AI & Full-Stack Engineer",
  location: "Melbourne, Australia",
  timezone: "Australia/Melbourne",
  tagline: "I build things, break things, fix things.",
  bio: [
    "I'm a Master's student in Artificial Intelligence at Monash, after a year and a half at Tata Consultancy Services building core banking systems for HDFC Bank.",
    "I move between full-stack engineering and applied ML — lately that means shipping AI products like MODO and Kisan Copilot, and poking inside transformers to see how they actually work. I learn fastest by building things, breaking them, and figuring out exactly why. Outside of code I write music and take photos.",
  ],
  status: "Open to opportunities in AI/ML and full-stack engineering.",
  email: "nikshith.online@gmail.com",
  photo: "/images/Profile/Profile.png",
  resume: "/resume.pdf",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/NIKSHITH-G" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nikshith-g-08368a246" },
  { label: "Studio", href: "https://nikshith-studio.vercel.app" },
  { label: "YouTube", href: "https://youtube.com/@Nikshith.online" },
  { label: "Instagram", href: "https://www.instagram.com/nikshith.online/" },
  { label: "Photography", href: "https://www.instagram.com/enigma_view/" },
];

export const experience = [
  {
    role: "Systems Engineer",
    company: "Tata Consultancy Services",
    dates: "Sep 2024 – Feb 2026",
    location: "Bangalore, India",
    bullets: [
      "Developed and maintained Java Spring Boot REST APIs for HDFC Bank's core banking modules, supporting high-volume financial transactions in the BFSI domain.",
      "Built and executed automated test suites (unit, integration, regression) with Selenium, reducing manual QA effort and improving release confidence.",
      "Performed root cause analysis on production defects across 3+ banking modules and contributed to CI/CD pipelines for consistent deployments.",
      "Delivered features and bug fixes in an agile CRM team of 10+ for critical banking systems under tight deadlines.",
    ],
  },
  {
    role: "AI Developer Intern",
    company: "Google Developers · SmartInternz",
    dates: "Jun 2023 – Jul 2023",
    location: "Remote",
    bullets: [
      "Developed an interactive GUI application to enhance mathematics learning using AI-based shape recognition.",
      "Implemented TensorFlow and Keras models to detect hand-drawn shapes and generate the relevant formulas.",
      "Built and deployed the application with Flask, NumPy and Matplotlib, working in Jupyter, IBM Watson Studio and Anaconda.",
    ],
  },
];

export const education = [
  {
    school: "Monash University",
    degree: "Master of Artificial Intelligence — ML, deep learning, data science",
    years: "2026 – 2028",
    image: "/images/Timeline/step3.png",
  },
  {
    school: "Vellore Institute of Technology",
    degree: "B.Tech in Computer Science & Engineering · CGPA 8.0/10",
    years: "2020 – 2024",
    image: "/images/Timeline/step2.png",
  },
  {
    school: "Narayana Saraswathi Pati",
    degree: "Mathematics, Physics & Chemistry",
    years: "2018 – 2020",
    image: "/images/Timeline/step1.png",
  },
];

export const projects = [
  {
    name: "MODO",
    tagline: "Flashcards that actually stick.",
    year: "2026",
    color: "#a78bfa",
    url: "https://www.themodo.in",
    repo: "https://github.com/NIKSHITH-G/workspace-app",
    points: [
      "Spaced-repetition study app that schedules every review with the SM-2 algorithm — the maths behind Anki — so cards come back right before you'd forget them.",
      "240+ cards across Python for AI, Database Systems, Computer Architecture and Maths, in 10 languages.",
      "XP, streaks and a leaderboard to make revision feel like a game, plus a guest mode to try it without signing up.",
    ],
    stack: ["Next.js 16", "React 19", "Prisma", "Clerk", "Claude API", "Gemini API", "SM-2"],
    images: ["/images/Projects/modo.jpg"],
  },
  {
    name: "GPT-2 Pronoun Circuit",
    tagline: "Finding the five heads that decide 'he' or 'she'.",
    year: "2026",
    color: "#f472b6",
    url: null,
    repo: "https://github.com/NIKSHITH-G/gpt2-pronoun-circuit",
    points: [
      "Mechanistic-interpretability study of how GPT-2 Small resolves pronouns after 'because' clauses, using activation patching, head ablation and attention visualisation.",
      "Traced the behaviour to a sparse 5-head circuit across layers 4–9 — just 3.5% of the model's heads.",
      "Ablating those heads flips the model's preference to the wrong pronoun (logit diff +0.107 → −0.038); head L7H3 turns out to track the grammatical subject and verb.",
    ],
    stack: ["TransformerLens", "Activation patching", "CircuitsVis", "Plotly", "Colab"],
    images: [],
  },
  {
    name: "Kisan Copilot",
    tagline: "A farming advisor that speaks your language.",
    year: "2026",
    color: "#34d399",
    url: "https://kisan-copilot.vercel.app",
    repo: "https://github.com/NIKSHITH-G/kisan-copilot",
    points: [
      "Voice-first crop-advisory copilot for Indian farmers, built for the Snowflake CoCo CLI Hackathon 2026.",
      "Ask in Telugu, Hindi or English — it works out your district and crop, then answers with live market prices, weather and agronomy reasoned inside Snowflake.",
      "Guardrails stop it inventing prices it doesn't have.",
    ],
    stack: ["FastAPI", "Snowflake", "Sarvam AI", "MCP", "Python"],
    images: ["/images/Projects/kisan.jpg"],
  },
  {
    name: "Tabi",
    tagline: "Your life is a journey. Tabi is where it lives.",
    year: "2026",
    color: "#fb923c",
    url: "https://tabi-nine-plum.vercel.app",
    repo: "https://github.com/NIKSHITH-G/tabi",
    points: [
      "A personal digital world: photos, notes, places and memories as real objects, connected to each other.",
      "Show them as a canvas of movable widgets, or on a 3D globe of where each memory happened.",
      "Every user gets a permanent home at tabi.app/<username>.",
    ],
    stack: ["Next.js 16", "React Three Fiber", "Prisma", "Neon Postgres", "Clerk"],
    images: ["/images/Projects/tabi.jpg"],
  },
  {
    name: "Smart Mathematics Tutor",
    tagline: "Draw a shape, get the formula.",
    year: "2023",
    color: "#60a5fa",
    url: null,
    repo: "https://github.com/NIKSHITH-G/Smart-Mathematics-Tutor",
    points: [
      "CNN that classifies hand-drawn shapes with ~99% precision.",
      "Flask app that detects the shape and shows its formulas, area and perimeter in real time.",
      "Image preprocessing and data augmentation to make the model robust to messy drawings.",
    ],
    stack: ["TensorFlow", "Keras", "OpenCV", "Flask", "NumPy", "Matplotlib"],
    images: ["/images/Projects/AI1.png", "/images/Projects/AI2.png", "/images/Projects/AI3.png"],
  },
  {
    name: "Blockchain Secure Storage",
    tagline: "File sharing secured by a blockchain.",
    year: "2023",
    color: "#facc15",
    url: null,
    repo: null,
    points: [
      "AES encryption with SHA-512 hashing, plus a comparative analysis of MD5, SHA-1, SHA-256 and SHA-512.",
      "Smart contracts for secondary verification across a 4-stage pipeline: data owner, data user, private chain, public chain.",
    ],
    stack: ["Blockchain", "Smart contracts", "AES", "SHA-512", "MySQL"],
    images: ["/images/Projects/blockchain2.jpeg", "/images/Projects/blockchain1.jpeg", "/images/Projects/blockchain3.jpeg"],
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "Java", "TypeScript", "JavaScript", "SQL"] },
  { group: "Web", items: ["Next.js", "React", "Spring Boot", "FastAPI", "Flask", "Prisma"] },
  { group: "AI / ML", items: ["TensorFlow", "Keras", "TransformerLens", "OpenCV", "NumPy", "LLM APIs"] },
  { group: "Tools", items: ["Git", "Jenkins", "CI/CD", "Selenium", "Postman", "Snowflake", "Vercel"] },
];

export const certifications = [
  { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", image: "/images/certificates/aws-cloud-practitioner.jpg" },
  { title: "Artificial Intelligence Externship", issuer: "Google Developers · SmartInternz", image: "/images/certificates/SmartBridge_AI.png" },
  { title: "Full-Stack Web Developer (MERN)", issuer: "PreGrad", image: "/images/certificates/PREGRAD.jpg" },
  { title: "Web Developer Internship", issuer: "AR Brands", image: "/images/certificates/AR-BRANDS.png" },
  { title: "GRE — 322 / 340", issuer: "ETS", image: "/images/certificates/GRE.jpg" },
];

export const music = {
  latest: { title: "Airplane Mode", released: "8 Oct 2026", length: "3:17" },
  studio: "https://nikshith-studio.vercel.app",
  youtube: "https://youtube.com/@Nikshith.online",
};

export const photography = {
  handle: "@enigma_view",
  href: "https://www.instagram.com/enigma_view/",
};

// The "Now" board in the living room — what's happening at the moment.
// Update this whenever it changes; it's the first thing recruiters read.
export const now = {
  updated: "Oct 2026",
  items: [
    { label: "Studying", text: "Master of Artificial Intelligence at Monash University, Melbourne (2026–2028)." },
    { label: "Building", text: "MODO, Tabi, and this studio — an explorable 3D portfolio." },
    { label: "Exploring", text: "Mechanistic interpretability: how transformers actually make decisions." },
    { label: "Looking for", text: "Opportunities in AI/ML and full-stack engineering." },
  ],
};

// The "Training plan" whiteboard in the gym — what I'm levelling up.
export const learning = [
  { topic: "Machine learning", detail: "Monash MAI core" },
  { topic: "Deep learning", detail: "Monash MAI core" },
  { topic: "Data science", detail: "Monash MAI core" },
  { topic: "Mechanistic interpretability", detail: "TransformerLens, activation patching" },
  { topic: "Shipping AI products", detail: "Next.js + LLM APIs (MODO, Kisan Copilot)" },
];

// The "Side quests" board in the games room.
export const quests = {
  shipped: ["MODO", "Kisan Copilot", "GPT-2 Pronoun Circuit", "Tabi"],
  building: ["nikshith.dev — this 3D studio", "Tabi — personal digital worlds"],
  next: ["An AI version of me you can talk to, right here in the studio"],
};

// The Kindle in the library. Add books as { title, author, note? }.
// Leave the arrays empty and the Kindle shows a "syncing" screen.
export const reading = {
  current: [],
  finished: [],
};
