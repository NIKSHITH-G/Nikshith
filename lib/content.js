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
  // shown in the camera's viewfinder; `hang` says where its print hangs in the building
  photos: [
    { src: "/images/photos/pier-sunset.jpg", title: "Pier at golden hour", tag: "landscape", hang: "studio-living" },
    { src: "/images/photos/ship-sunset.jpg", title: "Sun-set sail", tag: "landscape", hang: "studio-music" },
    { src: "/images/photos/noisy-miner.jpg", title: "Noisy miner in blossom", tag: "wildlife", hang: "photo-1" },
    { src: "/images/photos/corellas.jpg", title: "Corellas, in love", tag: "wildlife", hang: "photo-2" },
    { src: "/images/photos/fireworks.jpg", title: "Fireworks over the water", tag: "night", hang: "studio-dining" },
    { src: "/images/photos/coastline.jpg", title: "Coastline, city on the horizon", tag: "landscape", hang: "gym" },
    { src: "/images/photos/cat.jpg", title: "The neighbourhood boss", tag: "street", hang: "photo-3" },
    { src: "/images/photos/ginger-cat.jpg", title: "Ginger in the grass", tag: "street", hang: "photo-4" },
    { src: "/images/photos/lizard.jpg", title: "Green in the canopy", tag: "wildlife", hang: "games-west" },
    { src: "/images/photos/gyg-sunset.jpg", title: "Burrito-o'clock sunset", tag: "street", hang: "games-east" },
    { src: "/images/photos/calico.jpg", title: "Calico on the lookout", tag: "street", hang: "photo-5" },
  ],
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

// The Kindle in the library, curated from Nikshith's real Kindle library.
// Covers come from Open Library (openlibrary.org), stored in public/images/books.
// `ideas` are key ideas written as summaries (not quotes from the books) —
// swap in your own Kindle highlights any time.
export const reading = {
  favourite: "Shadow Slave",
  shelves: [
    {
      name: "All-time favourite",
      books: [
        {
          title: "Shadow Slave",
          cover: "/images/books/shadow-slave.jpg",
          author: "Guiltythree",
          colors: ["#0b0b10", "#9ca3af"],
          line: "A boy with nothing but a cursed Aspect and a sharp mind survives a nightmare world by out-thinking everything that wants him dead.",
          why: "My favourite story, full stop. Sunny wins by understanding the rules better than anyone else — that's the kind of hero I root for.",
          ideas: [
            "Your weaknesses are only fatal if you refuse to study them.",
            "Patience and observation beat raw power more often than you'd think.",
            "The people who survive are the ones who keep adapting, not the ones who start strongest.",
          ],
        },
      ],
    },
    {
      name: "Epic fantasy",
      books: [
        {
          title: "Mistborn Trilogy",
          cover: "/images/books/mistborn.jpg",
          author: "Brandon Sanderson",
          colors: ["#1e293b", "#f8fafc"],
          line: "A street thief learns to burn metals for power and joins a crew planning the impossible: overthrowing an immortal god-emperor.",
          ideas: [
            "A magic system with clear rules makes every clever twist feel earned.",
            "Hope can be a deliberate choice, even when the world gives you no reason for it.",
          ],
        },
        {
          title: "The Alloy of Law",
          cover: "/images/books/alloy-of-law.jpg",
          author: "Brandon Sanderson",
          colors: ["#f5f0e1", "#1c1917"],
          line: "Mistborn three hundred years later — trains, revolvers and Allomancy in a Wild West–meets–Victorian city.",
          ideas: ["The same rules, in a new era, create a completely different story."],
        },
        {
          title: "Shadows of Self",
          cover: "/images/books/shadows-of-self.jpg",
          author: "Brandon Sanderson",
          colors: ["#7f1d1d", "#fde68a"],
          line: "Wax and Wayne hunt a killer who can wear any face, while the city edges towards revolution.",
          ideas: ["Identity is more than appearance — it's the choices you keep making."],
        },
        {
          title: "The Bands of Mourning",
          cover: "/images/books/bands-of-mourning.jpg",
          author: "Brandon Sanderson",
          colors: ["#1e3a8a", "#e0f2fe"],
          line: "A treasure hunt for a mythical artifact that could rewrite what anyone thought magic could do.",
          ideas: ["The best adventures change the map of what's possible."],
        },
        {
          title: "Lord of the Mysteries",
          cover: "/images/books/lord-of-mysteries.jpg",
          author: "Cuttlefish That Loves Diving",
          colors: ["#18181b", "#dc2626"],
          line: "A Victorian-steampunk world of secret societies and Beyonder pathways, where every power has a terrible price.",
          ideas: [
            "Power that comes without understanding eventually costs you yourself.",
            "Careful, methodical progress outlasts reckless leaps.",
          ],
        },
      ],
    },
    {
      name: "Mind, money & building",
      books: [
        {
          title: "Zero to One",
          cover: "/images/books/zero-to-one.jpg",
          author: "Peter Thiel with Blake Masters",
          colors: ["#facc15", "#111827"],
          line: "Notes on startups and how to build the future instead of copying the present.",
          ideas: [
            "Going from 0 to 1 — making something new — is worth more than going from 1 to n.",
            "Ask what important truth very few people agree with you on.",
          ],
        },
        {
          title: "The Psychology of Money",
          cover: "/images/books/psychology-of-money.jpg",
          author: "Morgan Housel",
          colors: ["#fafaf9", "#14532d"],
          line: "Short stories about how people actually think and behave around money.",
          ideas: [
            "Doing well with money is more about behaviour than intelligence.",
            "Compounding rewards whoever can stay in the game the longest.",
          ],
        },
        {
          title: "Die With Zero",
          cover: "/images/books/die-with-zero.jpg",
          author: "Bill Perkins",
          colors: ["#2563eb", "#facc15"],
          line: "An argument for spending your money — and your time — on experiences while you can still enjoy them.",
          ideas: ["Memories pay a dividend for the rest of your life, so invest in them early."],
        },
        {
          title: "Influence",
          cover: "/images/books/influence.jpg",
          author: "Robert B. Cialdini",
          colors: ["#f97316", "#1c1917"],
          line: "The psychology of persuasion: why we say yes, and how to notice when someone is steering us.",
          ideas: [
            "Reciprocity, commitment, social proof, authority, liking and scarcity drive most of our yeses.",
            "Knowing the levers is the best defence against having them pulled on you.",
          ],
        },
        {
          title: "Psycho-Cybernetics",
          cover: "/images/books/psycho-cybernetics.jpg",
          author: "Maxwell Maltz",
          colors: ["#fef3c7", "#b91c1c"],
          line: "A classic on self-image: change how you see yourself and your behaviour follows.",
          ideas: ["Your self-image sets the limits of what you'll attempt."],
        },
        {
          title: "The 48 Laws of Power",
          cover: "/images/books/48-laws-of-power.jpg",
          author: "Robert Greene",
          colors: ["#b91c1c", "#1e3a8a"],
          line: "History's lessons on power — worth reading to recognise the games, whether or not you play them.",
          ideas: ["Pay attention to what people do, not just what they say."],
        },
      ],
    },
    {
      name: "Stories that stay with you",
      books: [
        {
          title: "The Metamorphosis",
          cover: "/images/books/metamorphosis.jpg",
          author: "Franz Kafka",
          colors: ["#1e293b", "#e7e5e4"],
          line: "Gregor Samsa wakes up transformed into an insect, and his family's love turns out to have conditions.",
          ideas: ["How we treat people when they stop being useful says everything."],
        },
        {
          title: "The Nightingale",
          cover: "/images/books/the-nightingale.jpg",
          author: "Kristin Hannah",
          colors: ["#134e4a", "#d6b77a"],
          line: "Two sisters in occupied France resist the war in very different ways.",
          ideas: ["Courage doesn't always look loud — sometimes it's quiet and daily."],
        },
        {
          title: "The Frozen River",
          cover: "/images/books/frozen-river.jpg",
          author: "Ariel Lawhon",
          colors: ["#e2e8f0", "#475569"],
          line: "A midwife in 1789 Maine investigates a death the town would rather forget.",
          ideas: ["Writing things down is a quiet form of power."],
        },
      ],
    },
  ],
};
