import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { CustomersList } from "@/components/team/customers-list";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { CustomerList } from "@/lib/team/types";

export const metadata: Metadata = { title: "Customers" };

/** Customers (screen 26). Developers get "not found" from the backend. */
async function CustomersContent({
  searchParams,
}: PageProps<"/team/customers">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const list = await serverApi<CustomerList>(
    `/team/customers${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    { signIn: routes.teamSignIn },
  );
  // A new search starts with its own search text.
  return <CustomersList key={query} list={list} query={query} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function CustomersPage(props: PageProps<"/team/customers">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CustomersContent {...props} />
    </Suspense>
  );
}
