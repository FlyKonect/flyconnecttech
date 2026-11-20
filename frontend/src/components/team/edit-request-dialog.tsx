"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { requestTypes, type RequestType } from "@/lib/labels";
import type { TeamRequestDetail } from "@/lib/team/types";

/**
 * "Edit details" (admins and managers): correct a request's title, type or
 * project (one of the same customer's). The conversation gets a line that
 * says what changed.
 */
export function EditRequestButton({ request }: { request: TeamRequestDetail }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(request.title);
  const [type, setType] = React.useState<RequestType>(request.type);
  const [projectId, setProjectId] = React.useState(request.projectId);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  function start() {
    setTitle(request.title);
    setType(request.type);
    setProjectId(request.projectId);
    setError("");
    setOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Enter a title");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(
        `/team/requests/${encodeURIComponent(request.code)}/details`,
        {
          method: "POST",
          body: { title: title.trim(), type, projectId },
        },
      );
      toast(`${request.code} saved`);
      setOpen(false);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="h-11 px-4" onClick={start}>
        Edit details
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Edit {request.code}</DialogTitle>
          <DialogDescription>
            Correct a typo, the wrong type or the wrong project. The customer
            sees the change; the conversation notes it.
          </DialogDescription>
          <form noValidate onSubmit={save} className="mt-4 flex flex-col gap-4">
            <Field label="Title" required>
              <Input
                value={title}
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field label="Request type">
              <Select
                value={type}
                onChange={(event) => setType(event.target.value as RequestType)}
              >
                {Object.entries(requestTypes).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Project">
              <Select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                {request.projectChoices.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} · {project.code}
                  </option>
                ))}
              </Select>
            </Field>
            {error ? <FormError>{error}</FormError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
