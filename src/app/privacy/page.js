
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | RankBoost",
  description: "Learn how RankBoost handles account information, website URLs and SEO reports.",
};

const sections = [
  {
    title: "1. Information We Collect",
    text: "RankBoost may collect account information required for authentication, website URLs submitted for SEO audits, audit results, and files or CSV data that users choose to upload.",
  },
  {
    title: "2. How We Use Information",
    text: "We use submitted information to provide website audits, generate SEO recommendations, display performance reports and improve the functionality of RankBoost.",
  },
  {
    title: "3. Account and Data Storage",
    text: "RankBoost uses Supabase for authentication and related application data. Access to account-related information is subject to the application's security configuration and applicable service policies.",
  },
  {
    title: "4. Third-Party Services",
    text: "RankBoost may use third-party services such as Google PageSpeed Insights, Google Search Console exports and AI services to provide certain features. These services may process information according to their own privacy policies.",
  },
  {
    title: "5. Uploaded Files",
    text: "Users may upload CSV files exported from Google Search Console or other supported sources. These files are used to generate the requested SEO performance reports.",
  },
  {
    title: "6. Data Security",
    text: "We take reasonable steps to protect application information. However, no online service can guarantee absolute security.",
  },
  {
    title: "7. Data Retention",
    text: "Information may be retained while an account is active or as needed to provide the service, maintain security and meet applicable legal requirements.",
  },
  {
    title: "8. Your Choices",
    text: "You should avoid submitting passwords, payment card information or other sensitive information through website audit fields or CSV uploads. Contact the RankBoost team for questions about your information.",
  },
  {
    title: "9. Policy Updates",
    text: "This Privacy Policy may be updated as RankBoost features and services change. Updates will be published on this page.",
  },
  {
    title: "10. Contact",
    text: "For privacy-related questions, please contact the RankBoost team through the contact details published on the official website.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Last updated: November 11, 2026
          </p>
        </header>

        <div className="card rounded-2xl p-6 md:p-10">
          <p className="mb-8 leading-7 text-[var(--muted)]">
            This policy explains how RankBoost handles information when you
            use our SEO analysis and reporting services.
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
