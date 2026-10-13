import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Cpu,
  Crown,
  GraduationCap,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/layouts/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureCard } from "@/components/FeatureCard";
import { CTASection } from "@/components/CTASection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AI Learning Hub — AI PULSE | MITS" },
      {
        name: "description",
        content:
          "AI Learning Hub is a student-focused AI community at MITS built on learning, practical exploration, workshops, tools and collaboration.",
      },
      { property: "og:title", content: "About AI Learning Hub — AI PULSE | MITS" },
      {
        property: "og:description",
        content:
          "A student-focused community helping MITS students understand Artificial Intelligence.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="AI Pulse"
            title="About AI Learning Hub"
            description="AI Learning Hub is a student-focused community designed to help students understand Artificial Intelligence through learning, practical exploration, workshops, tools, discussions and collaborative activities."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="Our Purpose"
              description="Make Artificial Intelligence approachable for every student through guided learning and hands-on exploration."
            />
            <FeatureCard
              icon={Target}
              title="Our Approach"
              description="Sessions, workshops, tool walkthroughs and open discussions that connect theory with practical application."
            />
            <FeatureCard
              icon={Users}
              title="Our Community"
              description="A collaborative student space where members share ideas, build projects and learn together."
            />
          </div>

          <section className="mt-20">
            <SectionHeading title="AI PULSE LEADERSHIP & COORDINATION" />

            <div className="mt-10 space-y-6">
              <LeadershipCard
                icon={Crown}
                role="CHIEF PATRON"
                names={["Dr. N. Vijaya Bhaskar Choudary"]}
                designation="Founder and Chancellor"
                prominent
              />

              <div className="grid gap-6 md:grid-cols-2">
                <LeadershipCard
                  icon={ShieldCheck}
                  role="PATRONS"
                  names={["Ms. Keerthi Nadella", "Shri. N. Dwarakanath"]}
                  designations={["Executive Director", "Pro Chancellor"]}
                />
                <LeadershipCard
                  icon={GraduationCap}
                  role="CHIEF - COORDINATOR"
                  names={["Dr. C. Yuvaraj"]}
                  designation="Vice Chancellor (I/c)"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <LeadershipCard
                  icon={UserRound}
                  role="SAC COORDINATOR"
                  names={["Dr. G. Reddy Hemantha"]}
                  designation="Asst. Professor, Dept. of ECE"
                />
                <LeadershipCard
                  icon={UserRound}
                  role="SAC CO-COORDINATOR"
                  names={["Dr. V. Naveen"]}
                  designation="Asst. Professor, Dept. of CST"
                />
                <LeadershipCard
                  icon={UserRound}
                  role="SAC CO-COORDINATOR"
                  names={["Mr. B.S.H. Shayeq Ahamed"]}
                  designation="Asst. Professor, Dept. of CSE(AI&ML)"
                />
                <LeadershipCard
                  icon={UserRound}
                  role="FACULTY COORDINATOR"
                  names={["Mr. S. Tipu Rahaman"]}
                  designation="Asst. Professor"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <LeadershipCard
                  icon={Users}
                  role="STUDENT COORDINATOR"
                  names={["PALAGIRI MAHAMMAD AMAN"]}
                  studentDetails={{
                    className: "II B.Tech CSM - A Section",
                    rollNumber: "25MRA09018",
                    phoneNumber: "9989706451",
                  }}
                />
                <LeadershipCard
                  icon={Users}
                  role="STUDENT COORDINATOR"
                  names={["N. ASHRAF VALI"]}
                  studentDetails={{
                    className: "III B.Tech CSE - A",
                    rollNumber: "24691A0540",
                    phoneNumber: "6281025228",
                  }}
                />
                <LeadershipCard
                  icon={Users}
                  role="STUDENT COORDINATOR"
                  names={["SIDDIQ"]}
                  studentDetails={{
                    className: "II B.Tech CAI - C Section",
                    rollNumber: "25MRA06149",
                    phoneNumber: "6301718438",
                  }}
                />
              </div>
            </div>
          </section>

          <div className="mt-16">
            <SectionHeading eyebrow="Focus areas" title="What We Do" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

function LeadershipCard({
  icon: Icon,
  role,
  names,
  designation,
  designations,
  prominent = false,
  studentDetails,
}: {
  icon: typeof Crown;
  role: string;
  names: string[];
  designation?: string;
  designations?: string[];
  prominent?: boolean;
  studentDetails?: {
    className: string;
    rollNumber: string;
    phoneNumber: string;
  };
}) {
  return (
    <article
      className={`glow-card group relative overflow-hidden p-6 sm:p-7 ${prominent ? "border-cyan/50 bg-cyan/[0.06] sm:p-8" : ""}`}
    >
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-[image:var(--gradient-pulse)] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />
      <div className="relative">
        <span className="inline-flex size-11 items-center justify-center rounded-xl border border-cyan/35 bg-cyan/10 text-cyan">
          <Icon className="size-5" />
        </span>
        <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-cyan uppercase">{role}</p>
        <div className={`mt-4 grid gap-4 ${names.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {names.map((name, index) => (
            <div className="min-w-0" key={name}>
              <h3 className="text-base font-bold tracking-wide text-foreground sm:text-lg">
                {name}
              </h3>
              {studentDetails ? (
                <>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Student Coordinator
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {studentDetails.className}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Roll No: {studentDetails.rollNumber}
                  </p>
                  <a
                    href={`tel:${studentDetails.phoneNumber}`}
                    aria-label={`Contact ${name}`}
                    title={`Contact ${name}`}
                    className="mt-4 inline-flex size-9 items-center justify-center rounded-lg border border-cyan/35 bg-cyan/10 text-cyan transition-colors hover:bg-cyan/20"
                  >
                    <Phone className="size-4" />
                  </a>
                </>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {designations?.[index] ?? designation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
