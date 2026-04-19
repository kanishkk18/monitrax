import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Bell,
  Clock,
  GitCompare,
  Zap,
  Shield,
  Code2,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Monitoring",
    description:
      "Full-page screenshots with pixel-level diff detection. See exactly what changed and where.",
  },
  {
    icon: GitCompare,
    title: "Smart Diff Viewer",
    description:
      "Side-by-side comparison with highlighted change regions. Red pixels = changed content.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Cron-based scheduling from every 15 minutes to weekly. Full custom cron support.",
  },
  {
    icon: Bell,
    title: "Dual Notifications",
    description:
      "Email alerts via Resend or SMTP, plus in-app notification center with unread badges.",
  },
  {
    icon: Code2,
    title: "XPath & JSON API",
    description:
      "Monitor specific DOM elements via XPath or track JSON API values for precise change detection.",
  },
  {
    icon: Shield,
    title: "Ignore Regions",
    description:
      "Mark dynamic areas like ads or timestamps to ignore, reducing false positives.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Changd</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <Badge variant="secondary" className="mb-6">
          Open source website monitor
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          Know when websites change.
          <br />
          <span className="text-primary">Before anyone else does.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Automated screenshot monitoring with pixel-level diff detection, flexible
          scheduling, and instant notifications. Built for developers and teams.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="px-8">
              Start monitoring for free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to track changes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider font-medium">
          Built with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Next.js 15",
            "Better Auth",
            "Prisma",
            "PostgreSQL",
            "BullMQ",
            "Redis",
            "Playwright",
            "pixelmatch",
            "Resend",
            "UploadThing",
            "AWS S3",
            "Turborepo",
          ].map((tech) => (
            <Badge key={tech} variant="outline" className="text-sm py-1 px-3">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-primary text-primary-foreground p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start monitoring?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Set up your first monitor in under 2 minutes.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-10">
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Changd</span>
          </div>
          <p>Open source website change monitor</p>
        </div>
      </footer>
    </div>
  );
}
