/**
 * Shown in the page area while a portal page gets its data from the
 * backend. The sidebar and header stay, so moving between pages is instant.
 * Each page wraps its data in <Suspense fallback={<PageLoading />}>.
 */
export function PageLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-5">
      <div className="h-[132px] animate-pulse rounded-3xl bg-white" />
      <div className="h-[260px] animate-pulse rounded-[22px] border border-line-2 bg-white" />
    </div>
  );
}
