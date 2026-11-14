import { Logo } from "@/components/brand/logo";
import { BackendStatus } from "@/components/dev/backend-status";
import { Button } from "@/components/ui/button";

/**
 * Phase 0 placeholder. It only proves the logo, fonts, colours and the link to
 * the backend work. The real home page replaces it in Phase 2.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center gap-10 px-5 py-16 sm:px-10">
      <Logo eager className="h-8 self-start sm:h-11" />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gold-text">Project setup</p>
        <h1 className="text-[clamp(38px,4.8vw,62px)] leading-[1.04] font-bold tracking-[-0.035em]">
          FlyConnect Tech
        </h1>
        <p className="max-w-xl text-lg leading-[1.6] text-body">
          The heading above is set in Inter Tight and this text is set in Inter.
          The real home page replaces this one in Phase 2.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="gold" size="lg">
          Gold button
        </Button>
        <Button size="lg">Navy button</Button>
        <Button variant="outline" size="lg">
          Outline button
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-navy p-8">
        <Logo onNavy className="h-8 sm:h-9" />
        <Logo variant="stacked" onNavy className="h-16" />
      </div>

      <BackendStatus />
    </main>
  );
}
