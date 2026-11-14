import { Card, CardTitle } from "@/components/ui/card";

/**
 * Placeholder. It only fills the team panel layout so the sidebar and header
 * can be checked. Phase 6 replaces it with the real role dashboards.
 */
export default function TeamDashboardPage() {
  return (
    <Card className="border-line">
      <CardTitle>Team panel layout</CardTitle>
      <p className="mt-2 max-w-xl text-[15px] leading-[1.6] text-body">
        This page shows the team panel&apos;s sidebar and header. The real
        dashboards replace this card in Phase 6.
      </p>
    </Card>
  );
}
