
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | RankBoost",
  description: "Read the terms and conditions for using RankBoost SEO tools and services.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    text: "By accessing or using RankBoost, you agree to these Terms of Service. If you do not agree, please do not use the service.",
  },
  {
    title: "2. Description of Service",
    text: "RankBoost provides SEO analysis, website auditing, performance reporting, keyword tracking and related tools. Features may change, be updated or become unavailable over time.",
  },
  {
    title: "3. User Accounts",
    text: "You are responsible for maintaining the confidentiality of your account credentials and for activities performed through your account. You must provide accurate information when creating an account.",
  },
  {
    title: "4. Acceptable Use",
    text: "You agree not to misuse RankBoost, interfere with its operation, attempt unauthorized access, upload malicious files or use the service for unlawful purposes.",
  },
  {
    title: "5. Website Audits and SEO Results",
    text: "SEO scores, recommendations and reports are provided for informational purposes. Search engine rankings depend on many factors outside our control. RankBoost does not guarantee specific rankings, traffic increases or business results.",
  },
  {
    title: "6. Third-Party Services",
    text: "Some features may rely on third-party services, including Supabase, Google services and AI providers. Your use of those features may also be subject to the applicable third-party terms and policies.",
  },
  {
    title: "7. User Content",
    text: "You retain responsibility for website URLs, CSV files and other information you submit. You must have the necessary rights and permissions to submit that information.",
  },
  {
    title: "8. Intellectual Property",
    text: "RankBoost's original branding, design and software are protected by applicable intellectual property laws. You may not copy, redistribute or commercially exploit protected materials without permission.",
  },
  {
    title: "9. Disclaimer and Limitation",
    text: "RankBoost is provided on an as-available basis. To the extent permitted by applicable law, we disclaim warranties and are not responsible for indirect losses arising from your use of the service.",
  },
  {
    title: "10. Changes to These Terms",
    text: "We may update these terms as the service evolves. Updated terms will be published on this page.",
  },
  {
    title: "11. Contact",
    text: "For questions about these Terms of Service, please contact the RankBoost team using the contact details published on the official website.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--primary-2)]">
            Legal information
          </p>
          <h1 className="mb-4 text-4xl font-semibold md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Last updated: November 11, 2026
          </p>
        </header>

        <div className="card rounded-2xl p-6 md:p-10">
          <p className="mb-8 leading-7 text-[var(--muted)]">
            These terms explain the conditions for accessing and using RankBoost.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-xl font-semibold">
                  {section.title}
                </h2>
                <p className="text-sm leading-7 text-[var(--muted)]">
                  {section.text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
