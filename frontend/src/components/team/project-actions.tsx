"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Paperclip } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileChip } from "@/components/ui/file-chip";
import {
  DateInput,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiErrorMessage, apiFetch } from "@/lib/api";
import {
  projectItemStatuses,
  projectStatuses,
  projectTypes,
  type ProjectItemStatus,
  type ProjectStatus,
} from "@/lib/labels";
import { plural } from "@/lib/plural";
import {
  ITEM_TITLE_MAX,
  itemLinesProblem,
  UPDATE_MAX,
  type ProjectItem,
  type ProjectUpdate,
} from "@/lib/projects";
import { routes } from "@/lib/routes";
import {
  projectDetailsSchema,
  type ProjectDetailsInput,
} from "@/lib/team/forms";
import type { TeamProjectPage } from "@/lib/team/types";
import { addFiles, FILE_ACCEPT } from "@/lib/uploads";

export const base = (code: string) =>
  `/team/projects/${encodeURIComponent(code)}`;

/** Calls the backend, shows a toast and refreshes the page. */
export function useAction() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  async function run(path: string, body: unknown, done: string) {
    setBusy(true);
    try {
      await apiFetch(path, { method: "POST", body });
      toast(done);
      router.refresh();
      return true;
    } catch (failed) {
      toast(apiErrorMessage(failed));
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, run };
}

/** The project's status, as a dropdown (super admins and admins). */
export function ProjectStatusChooser({
  code,
  status,
}: {
  code: string;
  status: ProjectStatus;
}) {
  const { busy, run } = useAction();
  return (
    <Select
      aria-label="Project status"
      value={status}
      disabled={busy}
      onChange={(event) => {
        const next = event.target.value as ProjectStatus;
        void run(
          `${base(code)}/status`,
          { status: next },
          `${code} is now ${projectStatuses[next].label}`,
        );
      }}
      className="h-10 w-auto py-0 pr-9 text-[13px] font-bold"
    >
      {Object.entries(projectStatuses).map(([value, { label }]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}

const detailsFrom = (project: TeamProjectPage): ProjectDetailsInput => ({
  name: project.name,
  type: project.type,
  description: project.description ?? "",
  startDate: project.startDate ?? "",
  targetDate: project.targetDate ?? "",
  liveDate: project.liveDate ?? "",
  supportUntil: project.supportUntil ?? "",
  liveUrl: project.liveUrl ?? "",
  testUrl: project.testUrl ?? "",
  builtWith: project.builtWith ?? "",
  leadId: project.lead?.id ?? "",
  teamNotes: project.teamNotes ?? "",
});

/** "Edit details": every field of the project. */
export function EditDetailsButton({ project }: { project: TeamProjectPage }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const form = useForm<ProjectDetailsInput>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: detailsFrom(project),
  });
  const errors = form.formState.errors;

  const save = form.handleSubmit(async (values) => {
    setError("");
    try {
      await apiFetch(`${base(project.code)}/details`, {
        method: "POST",
        body: values,
      });
      toast(`${project.code} saved`);
      setOpen(false);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    }
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          form.reset(detailsFrom(project));
          setError("");
          setOpen(true);
        }}
      >
        Edit details
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[720px]">
          <DialogTitle>Edit {project.code}</DialogTitle>
          <DialogDescription>
            The customer sees these details in their client portal, except the
            team notes.
          </DialogDescription>
          <form
            noValidate
            onSubmit={save}
            className="mt-4 flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
              <Field label="Project name" required error={errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>
              <Field label="Project type">
                <Select {...form.register("type")}>
                  {Object.entries(projectTypes).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Description" error={errors.description?.message}>
              <Textarea rows={3} {...form.register("description")} />
            </Field>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
              <Field label="Start" error={errors.startDate?.message}>
                <DateInput {...form.register("startDate")} />
              </Field>
              <Field label="Target" error={errors.targetDate?.message}>
                <DateInput {...form.register("targetDate")} />
              </Field>
              <Field label="Went live" error={errors.liveDate?.message}>
                <DateInput {...form.register("liveDate")} />
              </Field>
              <Field label="Support until" error={errors.supportUntil?.message}>
                <DateInput {...form.register("supportUntil")} />
              </Field>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
              <Field
                label="Live address"
                hint="For example https://www.bluewave.co.uk"
                error={errors.liveUrl?.message}
              >
                <Input type="url" {...form.register("liveUrl")} />
              </Field>
              <Field
                label="Test address"
                hint="Where the customer can try work in progress"
                error={errors.testUrl?.message}
              >
                <Input type="url" {...form.register("testUrl")} />
              </Field>
              <Field
                label="Built with"
                hint="For example Next.js, Amadeus, Stripe"
                error={errors.builtWith?.message}
              >
                <Input {...form.register("builtWith")} />
              </Field>
              <Field label="Project lead">
                <Select {...form.register("leadId")}>
                  <option value="">Nobody yet</option>
                  {project.leadChoices.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.jobTitle
                        ? `${lead.name} · ${lead.jobTitle}`
                        : lead.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              label="Team notes"
              hint="Only the team sees these: never the customer, emails or their data export."
              error={errors.teamNotes?.message}
            >
              <Textarea
                rows={3}
                className="border-[#F59E0B] bg-[#FFFBEB]"
                {...form.register("teamNotes")}
              />
            </Field>
            {error ? <FormError>{error}</FormError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * "Delete project". Refused while it has open requests. With no requests
 * and no updates it goes for good; otherwise it is hidden with its history.
 */
export function DeleteProjectButton({ project }: { project: TeamProjectPage }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const { open: openRequests, total } = project.requests;
  // Modules and discussions are history too (the backend decides).
  const forGood =
    total === 0 && project.updates.length === 0 && !project.modules.length;

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`${base(project.code)}/delete`, { method: "POST" });
      toast(`${project.code} is deleted`);
      if (forGood) {
        router.replace(routes.teamProjects);
      }
      router.refresh();
      setOpen(false);
    } catch (failed) {
      setError(
        failed instanceof ApiError && failed.code === "HAS_OPEN_REQUESTS"
          ? failed.message
          : apiErrorMessage(failed),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="dangerOutline"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        Delete project
      </Button>
      {open ? (
        <Dialog open onOpenChange={(next) => (next ? null : setOpen(false))}>
          <DialogContent>
            <DialogTitle>Delete {project.name}?</DialogTitle>
            {openRequests ? (
              <DialogDescription>
                {project.name} has {plural(openRequests, "open request")}. Move
                {openRequests === 1 ? " it" : " them"} to another project (Edit
                details on the request) or close{" "}
                {openRequests === 1 ? "it" : "them"} first.
              </DialogDescription>
            ) : forGood ? (
              <DialogDescription>
                It has no requests and no updates, so it is removed for good.
                This can&apos;t be undone.
              </DialogDescription>
            ) : (
              <>
                <DialogDescription>
                  It leaves the Projects list and the customer&apos;s portal.
                </DialogDescription>
                <ul className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-[1.55] text-body">
                  <li>
                    Its {plural(total, "request")}, items and updates stay as
                    history, its name marked &ldquo;(deleted)&rdquo;.
                  </li>
                  <li>You can restore it from the Deleted tab of Projects.</li>
                </ul>
              </>
            )}
            {error ? (
              <div className="mt-4">
                <FormError>{error}</FormError>
              </div>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                {openRequests ? "Close" : "Cancel"}
              </Button>
              {openRequests ? null : (
                <Button variant="danger" onClick={remove} disabled={busy}>
                  {busy ? "Deleting…" : "Delete project"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

export function RestoreProjectButton({ code }: { code: string }) {
  const { busy, run } = useAction();
  return (
    <Button
      onClick={() =>
        run(`${base(code)}/restore`, undefined, `${code} restored`)
      }
      disabled={busy}
    >
      {busy ? "Restoring…" : "Restore project"}
    </Button>
  );
}

// ------------------------------------------------------------ items

/**
 * An item's status dropdown (admins and team developers) and, for admins,
 * its "⋯": Edit, Move up, Move down, Remove.
 */
export function ItemControls({
  code,
  item,
  first,
  last,
  manage,
}: {
  code: string;
  item: ProjectItem;
  first: boolean;
  last: boolean;
  /** Edit, move and remove (super admins and admins). */
  manage: boolean;
}) {
  const { busy, run } = useAction();
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const path = `${base(code)}/items/${item.id}`;

  return (
    <span className="flex items-center gap-1.5">
      <Select
        aria-label={`Status of ${item.title}`}
        value={item.status}
        disabled={busy}
        onChange={(event) => {
          const status = event.target.value as ProjectItemStatus;
          void run(
            `${path}/status`,
            { status },
            `${item.title}: ${projectItemStatuses[status].label}`,
          );
        }}
        className="h-10 w-auto py-0 pr-9 text-[13px] font-bold"
      >
        {Object.entries(projectItemStatuses).map(([value, { label }]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      {manage ? (
        <RowMenu label={`Actions for ${item.title}`}>
          <RowMenuItem onSelect={() => setEditing(true)}>Edit</RowMenuItem>
          <RowMenuItem
            disabled={first}
            onSelect={() =>
              run(`${path}/move`, { direction: "up" }, `${item.title} moved up`)
            }
          >
            Move up
          </RowMenuItem>
          <RowMenuItem
            disabled={last}
            onSelect={() =>
              run(
                `${path}/move`,
                { direction: "down" },
                `${item.title} moved down`,
              )
            }
          >
            Move down
          </RowMenuItem>
          <RowMenuItem danger onSelect={() => setRemoving(true)}>
            Remove
          </RowMenuItem>
        </RowMenu>
      ) : null}
      {editing ? (
        <EditItemDialog
          item={item}
          onClose={() => setEditing(false)}
          onSave={async (title, detail) => {
            if (await run(path, { title, detail }, `${title} saved`)) {
              setEditing(false);
            }
          }}
          busy={busy}
        />
      ) : null}
      {removing ? (
        <Dialog
          open
          onOpenChange={(next) => (next ? null : setRemoving(false))}
        >
          <DialogContent>
            <DialogTitle>Remove {item.title}?</DialogTitle>
            <DialogDescription>
              It leaves the list and the progress is worked out again.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoving(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await run(
                      `${path}/remove`,
                      undefined,
                      `${item.title} removed`,
                    )
                  ) {
                    setRemoving(false);
                  }
                }}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </span>
  );
}

function EditItemDialog({
  item,
  onClose,
  onSave,
  busy,
}: {
  item: ProjectItem;
  onClose: () => void;
  onSave: (title: string, detail: string) => Promise<void>;
  busy: boolean;
}) {
  const [title, setTitle] = React.useState(item.title);
  const [detail, setDetail] = React.useState(item.detail ?? "");
  const [error, setError] = React.useState("");
  return (
    <Dialog open onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Edit item</DialogTitle>
        <DialogDescription>
          The customer sees the new wording.
        </DialogDescription>
        <form
          noValidate
          className="mt-4 flex flex-col gap-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            const clean = title.trim();
            if (!clean) return setError("Enter the item");
            if (clean.length > ITEM_TITLE_MAX) {
              return setError(`Keep it under ${ITEM_TITLE_MAX} characters`);
            }
            setError("");
            void onSave(clean, detail.trim());
          }}
        >
          <Field label="Item" required error={error}>
            <Input
              value={title}
              maxLength={ITEM_TITLE_MAX}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field label="Detail (optional)" hint="A short note under the item">
            <Textarea
              rows={2}
              maxLength={500}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
  );
}

/** "+ Add items": several lines at once, added at the end of a module. */
export function AddItemsForm({
  code,
  moduleId,
  moduleName,
}: {
  code: string;
  moduleId: string;
  moduleName: string;
}) {
  const { busy, run } = useAction();
  const [lines, setLines] = React.useState("");
  const [error, setError] = React.useState("");
  return (
    <form
      noValidate
      aria-label={`Add items to ${moduleName}`}
      className="mt-3 flex flex-col gap-2 rounded-2xl bg-[#F6F8FC] p-3.5"
      onSubmit={async (event) => {
        event.preventDefault();
        const problem = lines.trim() ? itemLinesProblem(lines) : "Add one item";
        setError(problem);
        if (problem) return;
        if (
          await run(
            `${base(code)}/items`,
            { moduleId, lines },
            `Items added to ${moduleName}`,
          )
        ) {
          setLines("");
        }
      }}
    >
      <Field
        label={`Add items to ${moduleName}`}
        hint="One item a line. They start as To do."
        error={error}
      >
        <Textarea
          rows={2}
          value={lines}
          onChange={(event) => setLines(event.target.value)}
          placeholder={"Flight search\nStripe payments"}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Adding…" : "Add items"}
        </Button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------ updates

/** The update composer: text and up to 5 files. The customer is emailed. */
export function UpdateComposer({ code }: { code: string }) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() && !files.length) {
      setError("Write the update or attach a file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("body", text.trim());
      for (const file of files) form.append("files", file);
      const result = await apiFetch<{ emailSent: boolean }>(
        `${base(code)}/updates`,
        { method: "POST", body: form },
      );
      setText("");
      setFiles([]);
      toast(
        result.emailSent
          ? "Update posted. The customer was emailed."
          : "Update posted. It shows in the customer's portal.",
      );
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={send}
      noValidate
      aria-label="Post an update"
      className="mt-3 overflow-hidden rounded-[18px] border border-[#CBD5E4] bg-white"
    >
      <textarea
        aria-label="Update for the customer"
        rows={3}
        value={text}
        maxLength={UPDATE_MAX}
        onChange={(event) => setText(event.target.value)}
        placeholder="What has been done, and what comes next"
        className="block w-full resize-y bg-transparent px-4 py-3.5 text-[15px] text-navy outline-none placeholder:text-muted-foreground"
      />
      {files.length ? (
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          {files.map((file) => (
            <FileChip
              key={`${file.name}-${file.size}`}
              look="picked"
              name={file.name}
              onRemove={() => setFiles(files.filter((f) => f !== file))}
            />
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="px-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line-3 px-3 py-2.5">
        <span className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-bold text-body hover:bg-soft"
          >
            <Paperclip aria-hidden="true" className="size-3.5" />
            Attach file
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={FILE_ACCEPT}
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? []);
              event.target.value = "";
              const result = addFiles(files, picked);
              setFiles(result.files);
              setError(result.error);
            }}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="text-[13px] text-muted-foreground">
            The customer gets this by email
          </span>
        </span>
        <Button type="submit" disabled={busy}>
          {busy ? "Posting…" : "Post update"}
        </Button>
      </div>
    </form>
  );
}

/** An update's "⋯": Edit (no new email) and Remove (with its files). */
export function UpdateMenu({
  code,
  update,
}: {
  code: string;
  update: ProjectUpdate;
}) {
  const { busy, run } = useAction();
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [text, setText] = React.useState(update.body);
  const path = `${base(code)}/updates/${update.id}`;

  return (
    <>
      <RowMenu label={`Actions for the update by ${update.authorName}`}>
        <RowMenuItem
          onSelect={() => {
            setText(update.body);
            setEditing(true);
          }}
        >
          Edit
        </RowMenuItem>
        <RowMenuItem danger onSelect={() => setRemoving(true)}>
          Remove
        </RowMenuItem>
      </RowMenu>
      {editing ? (
        <Dialog open onOpenChange={(next) => (next ? null : setEditing(false))}>
          <DialogContent>
            <DialogTitle>Edit update</DialogTitle>
            <DialogDescription>
              The customer sees the corrected text. No new email is sent.
            </DialogDescription>
            <form
              noValidate
              className="mt-4 flex flex-col gap-3.5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (
                  await run(path, { body: text.trim() }, "Update corrected")
                ) {
                  setEditing(false);
                }
              }}
            >
              <Field label="Update">
                <Textarea
                  rows={5}
                  maxLength={UPDATE_MAX}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
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
      ) : null}
      {removing ? (
        <Dialog
          open
          onOpenChange={(next) => (next ? null : setRemoving(false))}
        >
          <DialogContent>
            <DialogTitle>Remove this update?</DialogTitle>
            <DialogDescription>
              It leaves the project for the team and the customer
              {update.files.length
                ? `, with its ${plural(update.files.length, "file")}`
                : ""}
              . This can&apos;t be undone.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoving(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await run(`${path}/remove`, undefined, "Update removed")
                  ) {
                    setRemoving(false);
                  }
                }}
              >
                Remove update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
