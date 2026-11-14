import { Card, CardTitle } from "@/components/ui/card";

/**
 * Placeholder. It only fills the client portal layout so the sidebar and
 * header can be checked. Phase 5 replaces it with the real Overview.
 */
export default function PortalOverviewPage() {
  return (
    <Card>
      <CardTitle>Client portal layout</CardTitle>
      <p className="mt-2 max-w-xl text-[15px] leading-[1.6] text-body">
        This page shows the client portal&apos;s sidebar and header. The real
        Overview replaces this card in Phase 5.
      </p>
    </Card>
  );
}
