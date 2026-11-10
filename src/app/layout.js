import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RankBoost AI | AI-powered SEO audit and fixes",
  description:
    "Paste your website link and get an SEO score, page speed check, site crawl and AI-written fixes, with a ready-to-send PDF report.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "RankBoost AI | AI-powered SEO audit and fixes",
    description:
      "Find on-page SEO issues, get a mobile speed check and review AI-written fixes for your website.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "RankBoost AI SEO audit dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankBoost AI | AI-powered SEO audit and fixes",
    description:
      "Find on-page SEO issues, get a mobile speed check and review AI-written fixes for your website.",
    images: ["/opengraph-image"],
  },
};
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
