import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarClock,
  Cpu,
  FolderKanban,
  GraduationCap,
  Library,
  Newspaper,
  Presentation,
  Users,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/layouts/SiteLayout";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/FeatureCard";
import { EmptyState } from "@/components/EmptyState";
import { MeetingCard } from "@/components/MeetingCard";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetings";
import { StudentEvents } from "@/components/StudentEvents";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI PULSE — AI Learning Hub | MITS" },
      {
        name: "description",
        content:
          "AI PULSE is the student-driven AI Learning Hub at Madanapalle Institute of Technology & Science. Learn, explore and innovate with AI.",
      },
      { property: "og:title", content: "AI PULSE — AI Learning Hub | MITS" },
      {
        property: "og:description",
        content:
          "A student-driven AI community at MITS: learn, explore emerging tech and build together.",
      },
    ],
  }),
  component: Index,
});

const whyJoin = [
  {
    icon: GraduationCap,
    title: "Practical AI Exposure",
    description: "Work with real AI concepts through applied, hands-on learning.",
  },
  {
    icon: Presentation,
    title: "AI Workshops",
    description: "Attend guided workshops and sessions organised by the hub.",
  },
  {
    icon: Wrench,
    title: "AI Tools",
    description: "Explore tools that support coding, academics, research and productivity.",
  },
  {
    icon: Users,
    title: "Student Community",
    description: "Collaborate with peers who share an interest in Artificial Intelligence.",
  },
  {
    icon: FolderKanban,
    title: "Project Opportunities",
    description: "Team up on ideas and turn them into working AI projects.",
  },
  {
    icon: Library,
    title: "Learning Resources",
    description: "Access curated material to keep building your AI foundations.",
  },
];

function Index() {
  const { upcoming } = useMeetings();
  const { student } = useAuth();

  return (
    <SiteLayout>
      <Hero />

      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who we are"
            title="About AI Learning Hub"
            description="AI Learning Hub is a student-focused community designed to help students understand Artificial Intelligence through learning, practical exploration, workshops, tools, discussions and collaborative activities."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={BookOpen}
              title="AI Learning"
              description="Learn AI concepts, technologies and practical applications."
            />
            <FeatureCard
              icon={Cpu}
              title="AI Tools"
              description="Discover useful AI tools for coding, academics, creativity, productivity and research."
            />
            <FeatureCard
              icon={Newspaper}
              title="AI News"
              description="Stay updated with important developments in Artificial Intelligence."
            />
            <FeatureCard
              icon={Users}
              title="AI Community"
              description="Connect with students interested in AI and participate in workshops, activities and discussions."
            />
          </div>
        </div>
      </section>

      <section id="events" className="section-pad scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StudentEvents student={student} />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Schedule" title="Upcoming Meetings" />
          <div className="mt-10">
            {upcoming.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {upcoming.slice(0, 4).map((m) => (
                  <MeetingCard key={m.id} meeting={m} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming meetings scheduled yet."
                description="Announcements for sessions and workshops will appear here."
              />
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="neon" size="xl">
              <Link to="/meetings">View All Meetings</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Benefits" title="Why Join AI Learning Hub?" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyJoin.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}
