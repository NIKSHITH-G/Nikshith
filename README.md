# Nikshith G — Portfolio

My personal portfolio, live at **[nikshith.dev](https://nikshith.dev)**.

Built with **Next.js 16 (App Router)** and focused on creating smooth, interactive user experiences through custom animations, React Three Fiber, and modern web technologies.

---

## ✨ Features

- 🌐 Fully responsive portfolio website
- 🎨 Interactive animated mesh-grid background
- 💻 Terminal-inspired typing animation
- 📊 Live GitHub statistics and contribution graph
- 🧲 Magnetic hover effects and smooth animations
- 🚀 Fast performance with Next.js App Router
- 📬 Contact form powered by EmailJS
- 🌙 Modern dark-themed UI

---

## 🛠️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4

### Animations & 3D
- Framer Motion
- anime.js
- React Three Fiber
- drei
- postprocessing

### APIs & Services
- GitHub REST API
- GitHub GraphQL API
- EmailJS

### Deployment
- Vercel
- Custom Domain: **nikshith.dev**

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/NIKSHITH-G/Nikshith.git
cd Nikshith
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root.

```env
# GitHub Personal Access Token (Read-only)
GITHUB_TOKEN=your_token_here
```

The EmailJS service ID, template ID, and public key are configured inside:

```
app/contact/page.jsx
```

---

## 📂 Project Structure

```
app/
│
├── page.jsx                # Home page
├── about/                  # About section
├── contact/                # Contact page
├── api/github/             # GitHub statistics API
│
components/
│
├── Navbar
├── Interactive Mesh Grid
├── GitHub Contributions
├── Timeline
├── Project Cards
└── UI Components
```

---

## 🚀 Deployment

The application is deployed on **Vercel**.

Every push to the **main** branch automatically triggers a production deployment.

Live Website:

**https://nikshith.dev**

---

## 📬 Contact

Website:
**https://nikshith.dev**

GitHub:
**https://github.com/NIKSHITH-G**

LinkedIn:
**https://www.linkedin.com/in/nikshith-gorantla/**

---

## 📄 License

This repository is shared for learning and inspiration.

Feel free to explore the code and ideas, but please do not copy the project as-is.