import { DemoProvider } from "@/components/site/demo/demo-context";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TopBar } from "@/components/site/top-bar";

/** The public website: gold top bar, header, the page, navy footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    // DemoProvider lets every "Book a demo" button open the one demo dialog.
    <DemoProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-[10px] bg-navy px-4 py-3 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar />
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col overflow-x-clip">
        {children}
      </main>
      <SiteFooter />
    </DemoProvider>
  );
}
