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
  // No personal photo anywhere on the site: the blocky character stands in.
  // The TV in the living room shows `tvPhoto` once it's set (e.g. "/images/tv.jpg").
  tvPhoto: "/images/tv.jpg",
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

// Each school is a book on the study shelf. `photo` is the campus, `place` is shown
// on the title page, and `pages` are the spreads you turn through: each page is
// { heading, items: [{ title, text?, meta? }] } or { heading, photos: [src], caption }.
export const education = [
  {
    school: "Monash University",
    short: "Monash",
    degree: "Master of Artificial Intelligence",
    focus: "Machine learning · Deep learning · Data science",
    years: "2026 – 2028",
    place: "Melbourne, Australia",
    image: "/images/Timeline/step3.png",
    photo: "/images/education/monash.jpg",
    pages: [
      {
        heading: "What I'm studying",
        items: [
          { title: "Machine learning", text: "The core of the degree — models, evaluation and the maths underneath." },
          { title: "Deep learning", text: "Neural networks, from CNNs to transformers." },
          { title: "Data science", text: "Turning messy real-world data into something you can trust." },
        ],
      },
      {
        heading: "What I've built since arriving",
        items: [
          { title: "GPT-2 Pronoun Circuit", meta: "2026", text: "Found the 5 attention heads that decide 'he' or 'she' in GPT-2 Small." },
          { title: "MODO", meta: "2026", text: "Spaced-repetition flashcards with XP, streaks and 10 languages." },
          { title: "Kisan Copilot", meta: "2026", text: "Voice crop-advisor for Indian farmers — Snowflake CoCo CLI Hackathon." },
          { title: "Tabi & this studio", meta: "2026", text: "Personal digital worlds, and the 3D building you're standing in." },
        ],
      },
      {
        heading: "Melbourne, through my lens",
        photos: ["/images/photos/pier-sunset.jpg", "/images/photos/coastline.jpg"],
        caption: "A new city to learn as well as a new degree.",
      },
      {
        heading: "Next chapter",
        items: [
          { title: "Graduating 2028", text: "Master of Artificial Intelligence." },
          { title: "Open to opportunities", text: "AI/ML and full-stack engineering roles — let's talk." },
        ],
        cta: "contact",
      },
    ],
  },
  {
    school: "Vellore Institute of Technology",
    short: "VIT",
    degree: "B.Tech, Computer Science & Engineering",
    focus: "CGPA 8.0 / 10",
    years: "2020 – 2024",
    place: "India",
    image: "/images/Timeline/step2.png",
    photo: "/images/education/vit.jpg",
    pages: [
      {
        heading: "Projects",
        items: [
          { title: "Smart Mathematics Tutor", meta: "CNN · ~99% precision", text: "Draw a shape, get its formula, area and perimeter in real time." },
          { title: "Blockchain secure storage", meta: "AES · SHA-512", text: "File sharing with smart-contract access control across a 4-stage pipeline." },
        ],
      },
      {
        heading: "Internships & certificates",
        items: [
          { title: "AI Developer Intern", meta: "Google Developers · SmartInternz · 2023", text: "Shape-recognition maths tutor in TensorFlow, Keras and Flask." },
          { title: "Web Developer Intern", meta: "AR Brands", text: "Responsive web interfaces for real business requirements." },
          { title: "Full-Stack Web Developer (MERN)", meta: "PreGrad", text: "MongoDB, Express, React and Node." },
        ],
      },
      {
        heading: "What I picked up",
        tags: ["Python", "Java", "TensorFlow", "Keras", "OpenCV", "Flask", "Blockchain", "AES / SHA-512", "MySQL", "Git"],
      },
      {
        heading: "Where it led",
        items: [
          { title: "Graduated", meta: "2024", text: "B.Tech in Computer Science & Engineering, CGPA 8.0/10." },
          { title: "GRE", meta: "322 / 340", text: "On the way to a master's." },
          { title: "Systems Engineer, TCS", meta: "Sep 2024 – Feb 2026", text: "Core banking APIs for HDFC Bank." },
        ],
      },
    ],
  },
  {
    school: "Narayana Saraswathi Pati",
    short: "Narayana",
    degree: "Intermediate — Mathematics, Physics & Chemistry",
    focus: "MPC stream",
    years: "2018 – 2020",
    place: "India",
    image: "/images/Timeline/step1.png",
    photo: "/images/education/narayana.jpg",
    pages: [
      {
        heading: "The foundation",
        items: [
          { title: "Mathematics", text: "Where the problem-solving started." },
          { title: "Physics", text: "Models of how things actually work." },
          { title: "Chemistry", text: "Precision and patience." },
        ],
      },
      {
        heading: "Where it led",
        items: [{ title: "Computer Science at VIT", meta: "2020", text: "Turning the maths into code." }],
      },
    ],
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
          summary: "Sunny is a nobody from the outskirts who gets infected by the Nightmare Spell and dragged into the Dream Realm, a world of monsters and ruined civilisations. He's handed a powerful shadow Aspect, but its Flaw means he can never tell a lie. Over many volumes he climbs from a slave in the First Nightmare to something far more dangerous.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "I am nobody. And I have nothing. So let's change everything.", from: "Volume 8: Lord of Shadows" },
            { text: "Bonds of friendship were such a fragile thing. They were so hard to create, but so easy to break.", from: "Volume 3: Prince of Nothing" },
            { text: "Trust me. I'm the most honest person in the world. Two worlds, in fact.", from: "Volume 1: Child of Shadows" },
          ],
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
          summary: "For a thousand years ash has fallen and the immortal Lord Ruler has kept the skaa enslaved. Kelsier, a survivor with impossible powers, recruits Vin — a street urchin who doesn't know she's Mistborn — for a heist to bring the empire down. Across three books it grows from a heist story into a fight over the fate of the whole world.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "But you can't kill me, Lord Tyrant. I represent that one thing you've never been able to kill, no matter how hard you try. I am hope.", from: "Kelsier · The Final Empire" },
            { text: "Our belief is often strongest when it should be weakest. That is the nature of hope.", from: "The Final Empire" },
            { text: "There's always another secret.", from: "Kelsier · The Final Empire" },
          ],
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
          summary: "Waxillium Ladrian spent twenty years as a lawman out in the Roughs, then has to come home to the city of Elendel to run his noble house. A gang called the Vanishers is robbing trains and kidnapping women, and Wax — with his sharpshooting friend Wayne and the brilliant Marasi — can't stay retired.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "You put dynamite in the oven, Wayne.\" \"Gotta hide a gift where nobody'll look for it.", from: "Wax & Wayne series" },
          ],
          ideas: ["The same rules, in a new era, create a completely different story."],
        },
        {
          title: "Shadows of Self",
          cover: "/images/books/shadows-of-self.jpg",
          author: "Brandon Sanderson",
          colors: ["#7f1d1d", "#fde68a"],
          line: "Wax and Wayne hunt a killer who can wear any face, while the city edges towards revolution.",
          summary: "Elendel is close to boiling over, and a string of murders points to a killer who can wear anyone's face. Wax's hunt leads him to a rogue kandra and into a mystery that gets far more personal than he expected.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "He was tempted to call it the worst day of his life, but that would certainly be an exaggeration. The worst day of his life would be the one when he died.", from: "Wax & Wayne series" },
          ],
          ideas: ["Identity is more than appearance — it's the choices you keep making."],
        },
        {
          title: "The Bands of Mourning",
          cover: "/images/books/bands-of-mourning.jpg",
          author: "Brandon Sanderson",
          colors: ["#1e3a8a", "#e0f2fe"],
          line: "A treasure hunt for a mythical artifact that could rewrite what anyone thought magic could do.",
          summary: "Rumours say the Lord Ruler's legendary Bands of Mourning — which could give anyone his powers — have been found. Wax, Wayne, Marasi and Steris head south to find them, and uncover a civilisation and a technology no one in Elendel knew existed.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "I think we live stories every day. Ones that we will remember, and tell, and shape like clay to be what we need them to be.", from: "Hoid · Wax & Wayne series" },
          ],
          ideas: ["The best adventures change the map of what's possible."],
        },
        {
          title: "Lord of the Mysteries",
          cover: "/images/books/lord-of-mysteries.jpg",
          author: "Cuttlefish That Loves Diving",
          colors: ["#18181b", "#dc2626"],
          line: "A Victorian-steampunk world of secret societies and Beyonder pathways, where every power has a terrible price.",
          summary: "Zhou Mingrui wakes up in the body of Klein Moretti, a history graduate in a Victorian-style city of steam and gas lamps. To survive he joins the Nighthawks, takes the Seer pathway, and secretly gathers the Tarot Club as 'The Fool' above the gray fog — where every step up in power risks madness.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "The only lesson that humans can learn from history is that humans do not gain any lessons from history, and they're always repeating the same tragedies.", from: "Volume 1: The Clown" },
            { text: "To fight against the abyss, we have to endure the corruption of the abyss.", from: "Volume 2: The Clown" },
          ],
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
          summary: "Based on Peter Thiel's Stanford class on startups. His argument: real progress comes from creating something new (0 to 1), not copying what already works (1 to n) — and the best companies build a monopoly on a secret nobody else sees.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "Every moment in business happens only once.", from: "Chapter 1" },
            { text: "What important truth do very few people agree with you on?", from: "Chapter 1" },
          ],
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
          summary: "Twenty short chapters on why people make the money decisions they do. Housel's point is that financial success is a soft skill — it's about behaviour, patience and humility far more than intelligence or spreadsheets.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "Doing well with money has a little to do with how smart you are and a lot to do with how you behave.", from: "Introduction" },
            { text: "Wealth is what you don't see.", from: "Chapter 9" },
          ],
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
          summary: "Bill Perkins argues that most people save too much for too long and die with money they never enjoyed. The fix: spend on experiences at the age you can best enjoy them, because memories keep paying out for the rest of your life.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "The business of life is the acquisition of memories.", from: "Carson, Downton Abbey — quoted in the book" },
            { text: "Your life is the sum of your experiences.", from: "Bill Perkins" },
          ],
          ideas: ["Memories pay a dividend for the rest of your life, so invest in them early."],
        },
        {
          title: "Influence",
          cover: "/images/books/influence.jpg",
          author: "Robert B. Cialdini",
          colors: ["#f97316", "#1c1917"],
          line: "The psychology of persuasion: why we say yes, and how to notice when someone is steering us.",
          summary: "Robert Cialdini spent years studying salespeople, fundraisers and recruiters to learn why people say yes. He boils it down to a handful of principles — reciprocity, commitment, social proof, authority, liking and scarcity — and shows how to spot them being used on you.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "We view a behavior as more correct in a given situation to the degree that we see others performing it.", from: "Chapter 4: Social Proof" },
            { text: "Since 95 percent of the people are imitators and only 5 percent initiators, people are persuaded more by the actions of others than by any proof we can offer.", from: "Cavett Robert, quoted in the book" },
          ],
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
          summary: "Maxwell Maltz was a plastic surgeon who noticed that changing a patient's face didn't always change how they felt about themselves. This 1960 classic argues that your self-image steers your behaviour like a guidance system, and shows how to retrain it with imagination and practice.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "Within you right now is the power to do things you never dreamed possible.", from: "Maxwell Maltz" },
          ],
          ideas: ["Your self-image sets the limits of what you'll attempt."],
        },
        {
          title: "The 48 Laws of Power",
          cover: "/images/books/48-laws-of-power.jpg",
          author: "Robert Greene",
          colors: ["#b91c1c", "#1e3a8a"],
          line: "History's lessons on power — worth reading to recognise the games, whether or not you play them.",
          summary: "Robert Greene distils three thousand years of history — courtiers, con artists, generals and kings — into 48 laws of how power is won, kept and lost. Each law comes with stories of people who followed it and people who paid for breaking it.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "Never outshine the master.", from: "Law 1" },
            { text: "Conceal your intentions.", from: "Law 3" },
            { text: "Always say less than necessary.", from: "Law 4" },
          ],
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
          summary: "Gregor Samsa, a travelling salesman who supports his whole family, wakes up as a giant insect. The novella follows how his family's sympathy slowly turns into resentment once he can no longer provide for them.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.", from: "Opening line" },
            { text: "\"What's happened to me?\" he thought. It wasn't a dream.", from: "Part I" },
          ],
          ideas: ["How we treat people when they stop being useful says everything."],
        },
        {
          title: "The Nightingale",
          cover: "/images/books/the-nightingale.jpg",
          author: "Kristin Hannah",
          colors: ["#134e4a", "#d6b77a"],
          line: "Two sisters in occupied France resist the war in very different ways.",
          summary: "In Nazi-occupied France, two very different sisters fight the war in their own ways. Vianne has to share her home with a German officer to protect her daughter, while the reckless Isabelle joins the Resistance and leads downed airmen over the Pyrenees as 'the Nightingale'.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "In love we find out who we want to be; in war we find out who we are.", from: "Chapter 1" },
            { text: "Men tell stories. Women get on with it.", from: "Vianne" },
          ],
          ideas: ["Courage doesn't always look loud — sometimes it's quiet and daily."],
        },
        {
          title: "The Frozen River",
          cover: "/images/books/frozen-river.jpg",
          author: "Ariel Lawhon",
          colors: ["#e2e8f0", "#475569"],
          line: "A midwife in 1789 Maine investigates a death the town would rather forget.",
          summary: "Maine, 1789. When a man is found frozen in the Kennebec River, midwife Martha Ballard is called to examine the body — and her findings tie it to an assault the town's powerful men want buried. Based on the real diary Martha kept for 27 years.",
          // real lines from the book (checked against Goodreads / published excerpts)
          quotes: [
            { text: "Memory is a wicked thing that warps and twists. But paper and ink receive the truth without emotion, and they read it back without partiality.", from: "Martha Ballard" },
            { text: "Like all mothers, I have long since mastered the art of nursing joy at one breast and grief at the other.", from: "Martha Ballard" },
          ],
          ideas: ["Writing things down is a quiet form of power."],
        },
      ],
    },
  ],
};
