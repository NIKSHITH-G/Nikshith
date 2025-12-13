"use client";

const STACKS = [
  {
    id: "software",
    title: "Software I rely on",
    subtitle: "Tools that are almost always open while I work.",
    content: "Content for Software goes here.",
  },
  {
    id: "stack",
    title: "Engineering stack",
    subtitle: "Technologies I reach for when building products.",
    content: "Content for Stack goes here.",
  },
  {
    id: "workflow",
    title: "How I work",
    subtitle: "Habits and systems that keep me shipping.",
    content: "Content for Workflow goes here.",
  },
];

export default function StackBoard() {
  return (
    <section className="stack-section">
      {/* HEADER */}
      <div className="stack-header">
        <h2>Stack dashboard</h2>
        <p>Scroll to move through how I build, think, and work.</p>
      </div>

      {/* STACKING CARDS */}
      <ul
        className="stack-cards"
        style={{ "--numcards": STACKS.length }}
      >
        {STACKS.map((stack, i) => (
          <li
            key={stack.id}
            className="stack-card"
            style={{ "--index": i + 1 }}
          >
            <div className="stack-card__content">
              <h3>{stack.title}</h3>
              <p className="subtitle">{stack.subtitle}</p>
              <div className="body">{stack.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
