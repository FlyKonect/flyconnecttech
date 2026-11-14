import { BackendStatus } from "@/components/dev/backend-status";

/**
 * Placeholder home page. It only fills the website layout so the top bar,
 * header and footer can be checked. Phase 2 replaces it with the real Home page.
 */
export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center gap-4 px-[clamp(20px,4vw,40px)] py-[clamp(64px,8vw,112px)]">
      <p className="text-sm font-semibold text-gold-text">Website layout</p>
      <h1 className="text-[clamp(38px,4.8vw,62px)] leading-[1.04] font-bold tracking-[-0.035em]">
        FlyConnect Tech
      </h1>
      <p className="max-w-xl text-lg leading-[1.6] text-body">
        This page shows the website&apos;s top bar, header and footer. The real
        Home page replaces this text in Phase 2.
      </p>
      <BackendStatus />
    </section>
  );
}
