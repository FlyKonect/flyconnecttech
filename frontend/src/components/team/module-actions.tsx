"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { LabelPill } from "@/components/ui/pill";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { moduleStages, type ModuleStage, type TeamRole } from "@/lib/labels";
import { plural } from "@/lib/plural";
import type { ProjectModule } from "@/lib/projects";
import type { TeamMemberChoice } from "@/lib/team/types";

import { base, useAction } from "./project-actions";

/**
 * "Move to…": the stages this person may choose (admins any; developers
 * on the team the working ones and Client review), with an optional note
 * for the timeline. Client review emails the customer.
 */
export function StageControl({
  code,
  module,
  stages,
}: {
  code: string;
  module: ProjectModule;
  stages: ModuleStage[];
}) {
  const router = useRouter();
  const toast = useToast();
  const choices = stages.filter((stage) => stage !== module.stage);
  const [open, setOpen] = React.useState(false);
  const [stage, setStage] = React.useState<ModuleStage>(choices[0]);
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  if (!choices.length) return null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiFetch<{ emailSent: boolean }>(
        `${base(code)}/modules/${module.id}/stage`,
        { method: "POST", body: { stage, note: note.trim() } },
      );
      toast(
        `${module.name} moved to ${moduleStages[stage].label}${
          result.emailSent ? ". The customer was emailed." : ""
        }`,
      );
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setStage(next(module.stage, choices));
          setNote("");
          setError("");
          setOpen(true);
        }}
      >
        Move to…
      </Button>
      {open ? (
        <Dialog open onOpenChange={(value) => (value ? null : setOpen(false))}>
          <DialogContent>
            <DialogTitle>Move {module.name}</DialogTitle>
            <DialogDescription>
              Now: {moduleStages[module.stage].label}
              {module.round > 1 ? ` (round ${module.round})` : ""}. The move
              shows on the timeline for the team and the customer.
            </DialogDescription>
            <form
              noValidate
              onSubmit={save}
              className="mt-4 flex flex-col gap-3.5"
            >
              <Field label="New stage">
                <Select
                  value={stage}
                  onChange={(event) =>
                    setStage(event.target.value as ModuleStage)
                  }
                >
                  {choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {moduleStages[choice].label}
                    </option>
                  ))}
                </Select>
              </Field>
              {stage === "CLIENT_REVIEW" ? (
                <p className="rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm text-[#92400E]">
                  The customer is emailed to approve it or ask for changes.
                </p>
              ) : null}
              <Field
                label="Note (optional)"
                hint="For example: All payment tests pass"
              >
                <Textarea
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
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
                  {busy ? "Moving…" : "Move"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/** The next stage on the usual path, as the dialog's first choice. */
function next(stage: ModuleStage, choices: ModuleStage[]): ModuleStage {
  const after: Partial<Record<ModuleStage, ModuleStage>> = {
    NOT_STARTED: "DESIGN",
    DESIGN: "DEVELOPMENT",
    DEVELOPMENT: "TESTING",
    TESTING: "CLIENT_REVIEW",
    CHANGES_REQUESTED: "DEVELOPMENT",
    RETEST: "CLIENT_REVIEW",
    CLIENT_REVIEW: "DONE",
  };
  const wanted = after[stage];
  return wanted && choices.includes(wanted) ? wanted : choices[0];
}

type ModuleFields = {
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
};

/** The module's fields, in a dialog (Add module and Edit). */
function ModuleDialog({
  title,
  start,
  onClose,
  onSave,
}: {
  title: string;
  start: ModuleFields;
  onClose: () => void;
  onSave: (fields: ModuleFields) => Promise<string | null>;
}) {
  const [fields, setFields] = React.useState(start);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const set =
    (key: keyof ModuleFields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields({ ...fields, [key]: event.target.value });

  return (
    <Dialog open onOpenChange={(value) => (value ? null : onClose())}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          The customer sees the module, its stage and its items.
        </DialogDescription>
        <form
          noValidate
          className="mt-4 flex flex-col gap-3.5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!fields.name.trim()) return setError("Enter the module name");
            if (
              fields.startDate &&
              fields.targetDate &&
              fields.targetDate < fields.startDate
            ) {
              return setError("The target date is before the start");
            }
            setBusy(true);
            setError((await onSave(fields)) ?? "");
            setBusy(false);
          }}
        >
          <Field label="Module name" required>
            <Input
              value={fields.name}
              maxLength={160}
              placeholder="For example: Flight booking"
              onChange={set("name")}
            />
          </Field>
          <Field label="Description (optional)">
            <Textarea
              rows={2}
              maxLength={1000}
              value={fields.description}
              onChange={set("description")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3.5 max-app:grid-cols-1">
            <Field label="Start (optional)">
              <Input
                type="date"
                value={fields.startDate}
                onChange={set("startDate")}
              />
            </Field>
            <Field label="Target (optional)">
              <Input
                type="date"
                value={fields.targetDate}
                onChange={set("targetDate")}
              />
            </Field>
          </div>
          {error ? <FormError>{error}</FormError> : null}
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

/** Saves the module and refreshes; returns an error message or null. */
function useModuleSave() {
  const router = useRouter();
  const toast = useToast();
  return async (path: string, fields: ModuleFields, done: string) => {
    try {
      await apiFetch(path, {
        method: "POST",
        body: { ...fields, name: fields.name.trim() },
      });
      toast(done);
      router.refresh();
      return null;
    } catch (failed) {
      return apiErrorMessage(failed);
    }
  };
}

/** "+ Add module" (super admins and admins). */
export function AddModuleButton({ code }: { code: string }) {
  const [open, setOpen] = React.useState(false);
  const save = useModuleSave();
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add module</Button>
      {open ? (
        <ModuleDialog
          title="Add module"
          start={{ name: "", description: "", startDate: "", targetDate: "" }}
          onClose={() => setOpen(false)}
          onSave={async (fields) => {
            const error = await save(
              `${base(code)}/modules`,
              fields,
              `${fields.name.trim()} added`,
            );
            if (!error) setOpen(false);
            return error;
          }}
        />
      ) : null}
    </>
  );
}

/** A module's "⋯" (super admins and admins): Edit, Move, Remove. */
export function ModuleMenu({
  code,
  module,
  first,
  last,
}: {
  code: string;
  module: ProjectModule;
  first: boolean;
  last: boolean;
}) {
  const { busy, run } = useAction();
  const save = useModuleSave();
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const path = `${base(code)}/modules/${module.id}`;

  return (
    <>
      <RowMenu label={`Actions for ${module.name}`}>
        <RowMenuItem onSelect={() => setEditing(true)}>Edit</RowMenuItem>
        <RowMenuItem
          disabled={first}
          onSelect={() =>
            run(`${path}/move`, { direction: "up" }, `${module.name} moved up`)
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
              `${module.name} moved down`,
            )
          }
        >
          Move down
        </RowMenuItem>
        <RowMenuItem danger onSelect={() => setRemoving(true)}>
          Remove
        </RowMenuItem>
      </RowMenu>
      {editing ? (
        <ModuleDialog
          title={`Edit ${module.name}`}
          start={{
            name: module.name,
            description: module.description ?? "",
            startDate: module.startDate ?? "",
            targetDate: module.targetDate ?? "",
          }}
          onClose={() => setEditing(false)}
          onSave={async (fields) => {
            const error = await save(path, fields, `${fields.name} saved`);
            if (!error) setEditing(false);
            return error;
          }}
        />
      ) : null}
      {removing ? (
        <Dialog
          open
          onOpenChange={(value) => (value ? null : setRemoving(false))}
        >
          <DialogContent>
            <DialogTitle>Remove {module.name}?</DialogTitle>
            <DialogDescription>
              Its {plural(module.items.length, "item")} and its timeline go with
              it, for the team and the customer. Discussions about it are kept.
              This can&apos;t be undone.
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
                      `${module.name} removed`,
                    )
                  ) {
                    setRemoving(false);
                  }
                }}
              >
                Remove module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/**
 * The project team: the people on it and, for admins, Add and Remove.
 * Developers on the team see the project, move its stages and take part in
 * its discussions.
 */
export function ProjectTeamBox({
  code,
  members,
  choices,
  manage,
}: {
  code: string;
  members: (TeamMemberChoice & { role: TeamRole })[];
  choices: TeamMemberChoice[];
  manage: boolean;
}) {
  const { busy, run } = useAction();
  const [chosen, setChosen] = React.useState("");

  return (
    <div className="mt-3 flex flex-col gap-3">
      {members.length ? (
        <ul className="flex flex-col gap-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="min-w-0">
                <span className="block font-bold">{member.name}</span>
                {member.jobTitle ? (
                  <span className="block text-xs text-muted-foreground">
                    {member.jobTitle}
                  </span>
                ) : null}
              </span>
              <span className="flex items-center gap-1.5">
                <LabelPill group="role" value={member.role} />
                {manage ? (
                  <button
                    type="button"
                    aria-label={`Take ${member.name} off the team`}
                    disabled={busy}
                    onClick={() =>
                      run(
                        `${base(code)}/members/${member.id}/remove`,
                        undefined,
                        `${member.name} is off the team`,
                      )
                    }
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-soft hover:text-navy"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nobody yet. Super admins, admins and managers always see the project;
          add the developers who work on it.
        </p>
      )}
      {manage && choices.length ? (
        <form
          aria-label="Add to the team"
          className="flex flex-wrap items-end gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const person = choices.find((c) => c.id === chosen);
            if (!person) return;
            if (
              await run(
                `${base(code)}/members`,
                { userId: person.id },
                `${person.name} added to the team`,
              )
            ) {
              setChosen("");
            }
          }}
        >
          <Field label="Add someone" className="min-w-0 flex-[1_1_180px]">
            <Select
              value={chosen}
              onChange={(event) => setChosen(event.target.value)}
            >
              <option value="">Choose a team member</option>
              {choices.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.jobTitle
                    ? `${person.name} · ${person.jobTitle}`
                    : person.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" variant="outline" disabled={busy || !chosen}>
            Add
          </Button>
        </form>
      ) : null}
    </div>
  );
}
