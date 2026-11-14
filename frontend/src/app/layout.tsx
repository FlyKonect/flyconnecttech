import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

import { ToasterProvider } from "@/components/ui/toast";

// Inter: body and UI text. Inter Tight: headings, big numbers and the logo.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlyConnect Tech",
    template: "%s · FlyConnect Tech",
  },
  applicationName: "FlyConnect Tech",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
