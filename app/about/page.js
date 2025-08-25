"use client";
import Navbar from "../../components/Navbar";
import SideNavbar from "../../components/SideNavbar";
import Timeline from "../../components/Timeline";

export default function About() {
  const milestones = [
    {
      title: "Vellore Institute Of Technology",
      year: "2020-2024",
      image: "/images/Timeline/step1.png",
    },
    {
      title: "Narayana Saraswathi Pati",
      year: "2018-2020",
      image: "/images/Timeline/step2.png",
    },
    {
      title: "Narayana E-Techno School",
      year: "2016-2018",
      image: "/images/Timeline/step3.png",
    },
  ];
                       
  return (
    <>
      <Navbar />
      <SideNavbar />

      <main className="text-foreground px-6">
        <section
          id="about"
          className="min-h-screen flex flex-col items-center justify-center text-center py-12"
        >
          <h2 className="text-4xl font-bold mb-6">About Me</h2>
          <p className="max-w-2xl text-lg mb-8">
            I’m Nikshith, a passionate AI/ML enthusiast and full-stack developer
            who loves building impactful applications with modern web
            technologies.
          </p>
        </section>

        <section
          id="experience"
          className="min-h-screen flex justify-center items-center relative py-12"
        >
          <Timeline milestones={milestones} />
        </section>
      </main>
    </>
  );
}
