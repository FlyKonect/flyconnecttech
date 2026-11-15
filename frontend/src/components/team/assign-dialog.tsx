"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import type { Developer } from "@/lib/team/types";
import { cn } from "@/lib/utils";

/**
 * "Assign to a developer" (screen 23), or "Transfer to another developer".
 * Lists the active developers with their job title and open requests;
 * picking one assigns the request.
 *
 *   <AssignDialog code=… title=… developers=… current=…>
 *     <Button>Assign developer</Button>
 *   </AssignDialog>
 */
export function AssignDialog({
  code,
  title,
  developers,
  currentId = null,
  transfer = false,
  children,
}: {
  code: string;
  title: string;
  developers: Developer[];
  currentId?: string | null;
  transfer?: boolean;
  /** The button that opens it. */
  children: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  async function pick(developer: Developer) {
    setBusy(developer.id);
    setError("");
    try {
      await apiFetch(`/team/requests/${encodeURIComponent(code)}/assign`, {
        method: "POST",
        body: { developerId: developer.id, transfer },
      });
      setOpen(false);
      toast(`${code} assigned to ${developer.name}`);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {transfer ? "Transfer to another developer" : "Assign to a developer"}
        </DialogTitle>
        <DialogDescription>
          {code} · {title}
        </DialogDescription>
        {developers.length === 0 ? (
          <p className="mt-[18px] text-sm text-muted-foreground">
            There are no active developers yet.
          </p>
        ) : (
          <ul className="mt-[18px] flex flex-col gap-2">
            {developers.map((developer) => {
              const current = developer.id === currentId;
              return (
                <li key={developer.id}>
                  <button
                    type="button"
                    onClick={() => pick(developer)}
                    disabled={busy !== null || current}
                    aria-current={current || undefined}
                    className={cn(
                      "flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-line-2 bg-white px-3.5 py-2.5 text-left hover:border-[#C8D3E3] disabled:cursor-default",
                      current && "border-navy bg-tint",
                      busy === developer.id && "opacity-70",
                    )}
                  >
                    <Avatar name={developer.name} className="size-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold">
                        {developer.name}
                        {current ? (
                          <span className="font-medium text-muted-foreground">
                            {" "}
                            (assigned now)
                          </span>
                        ) : null}
                      </span>
                      {developer.jobTitle ? (
                        <span className="block text-[13px] text-muted-foreground">
                          {developer.jobTitle}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs font-bold text-body">
                      {developer.open} open
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
