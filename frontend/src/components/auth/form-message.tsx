import { Banner } from "@/components/ui/banner";

/** An error above a form's button. Read out at once by screen readers. */
export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      data-slot="form-error"
      className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-danger"
    >
      {children}
    </p>
  );
}

/** A green or blue note at the top of a form ("Your account is active..."). */
export function FormNotice({
  children,
  variant = "ok",
}: {
  children: React.ReactNode;
  variant?: "ok" | "info";
}) {
  return (
    <Banner role="status" variant={variant} className="mb-6">
      {children}
    </Banner>
  );
}
