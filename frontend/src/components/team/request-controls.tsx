"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AssignDialog } from "@/components/team/assign-dialog";
import {
  RequestInfoDialog,
  ResolveDialog,
} from "@/components/team/request-dialogs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chip, ChipGroup } from "@/components/ui/choice";
import { LabelPill } from "@/components/ui/pill";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  priorities,
  requestStatuses,
  type Priority,
  type RequestStatus,
} from "@/lib/labels";
import type { Developer, TeamRequestDetail } from "@/lib/team/types";

const STATUS_ORDER: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];
const PRIORITY_ORDER: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

/** Sends one change, says so, and refreshes the page. */
function useChange(code: string) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  const change = async (path: string, body: object, done: string) => {
    setBusy(true);
    try {
      await apiFetch(`/team/requests/${encodeURIComponent(code)}/${path}`, {
        method: "POST",
        body,
      });
      toast(done);
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  };
  return { busy, change };
}

/**
 * The buttons beside a request's title (screens 22 to 25): Assign developer
 * or Reassign, Transfer, Request more info, Resolve, Close request. Each
 * shows only when this person may use it (the backend checks again).
 */
export function RequestHeaderActions({
  request,
  developers,
}: {
  request: TeamRequestDetail;
  developers: Developer[];
}) {
  const { busy, change } = useChange(request.code);
  const { can, status } = request;
  const canWait = can.statuses.includes("WAITING_FOR_CUSTOMER");
  const canResolve = can.statuses.includes("RESOLVED");

  return (
    <div className="flex flex-wrap gap-2">
      {can.assign ? (
        <>
          <AssignDialog
            code={request.code}
            title={request.title}
            developers={developers}
            currentId={request.assignee?.id}
          >
            <Button className="h-11 px-4">
              {request.assignee ? "Reassign" : "Assign developer"}
            </Button>
          </AssignDialog>
          <AssignDialog
            code={request.code}
            title={request.title}
            developers={developers}
            currentId={request.assignee?.id}
            transfer
          >
            <Button variant="outline" className="h-11 px-4">
              Transfer
            </Button>
          </AssignDialog>
        </>
      ) : null}
      {canWait && status !== "CLOSED" ? (
        <RequestInfoDialog
          code={request.code}
          title={request.title}
          startText={request.requestInfoText}
        >
          <Button
            variant="outline"
            className="h-11 border-[#FED7AA] bg-[#FFF7ED] px-4 text-[#9A3412] hover:bg-[#FFEDD5]"
          >
            Request more info
          </Button>
        </RequestInfoDialog>
      ) : null}
      {canResolve && status !== "RESOLVED" && status !== "CLOSED" ? (
        <ResolveDialog code={request.code} title={request.title}>
          <Button variant="success" className="h-11 px-4">
            Resolve
          </Button>
        </ResolveDialog>
      ) : null}
      {can.close && status !== "CLOSED" ? (
        <Button
          variant="outline"
          className="h-11 px-4 text-body"
          disabled={busy}
          onClick={() => change("close", {}, `${request.code} is now Closed`)}
        >
          Close request
        </Button>
      ) : null}
    </div>
  );
}

/**
 * The first side panel: STATUS chips (a developer's limits explained),
 * PRIORITY chips ("Set by your manager" for developers) and ASSIGNED TO.
 */
export function RequestStatusPanel({
  request,
  developers,
  isDeveloper,
}: {
  request: TeamRequestDetail;
  developers: Developer[];
  isDeveloper: boolean;
}) {
  const { busy, change } = useChange(request.code);
  const { can } = request;

  return (
    <section
      aria-label="Status, priority and assignment"
      className="rounded-[22px] border border-line bg-white p-5"
    >
      <p
        id="status-label"
        className="text-[13px] font-bold text-muted-foreground"
      >
        STATUS
      </p>
      <ChipGroup
        aria-labelledby="status-label"
        value={request.status}
        disabled={busy}
        onValueChange={(value) => {
          const to = value as RequestStatus;
          void change(
            "status",
            { status: to },
            `${request.code} is now ${requestStatuses[to].label}`,
          );
        }}
        className="mt-2.5 gap-1.5"
      >
        {STATUS_ORDER.map((status) => (
          <Chip
            key={status}
            value={status}
            disabled={
              !can.statuses.includes(status) && status !== request.status
            }
          >
            {requestStatuses[status].label}
          </Chip>
        ))}
      </ChipGroup>
      {isDeveloper ? (
        <p className="mt-2 text-xs leading-normal text-muted-foreground">
          Developers can move a request to In Progress, Waiting for Customer or
          Resolved.
        </p>
      ) : null}

      <p
        id="priority-label"
        className="mt-[18px] text-[13px] font-bold text-muted-foreground"
      >
        PRIORITY
      </p>
      {can.changePriority ? (
        <ChipGroup
          aria-labelledby="priority-label"
          value={request.priority}
          disabled={busy}
          onValueChange={(value) => {
            const priority = value as Priority;
            void change(
              "priority",
              { priority },
              `Priority set to ${priorities[priority].label}`,
            );
          }}
          className="mt-2.5 gap-1.5"
        >
          {PRIORITY_ORDER.map((priority) => (
            <Chip key={priority} value={priority}>
              {priorities[priority].label}
            </Chip>
          ))}
        </ChipGroup>
      ) : (
        <p className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <LabelPill group="priority" value={request.priority} />
          Set by your manager
        </p>
      )}

      <p className="mt-[18px] text-[13px] font-bold text-muted-foreground">
        ASSIGNED TO
      </p>
      {can.assign ? (
        <AssignDialog
          code={request.code}
          title={request.title}
          developers={developers}
          currentId={request.assignee?.id}
        >
          <button
            type="button"
            className="mt-2.5 flex min-h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-stroke bg-white px-3 text-left text-sm font-bold hover:bg-soft"
          >
            <AssigneeMark name={request.assignee?.name} />
            {request.assignee?.name ?? "Unassigned"}
            <span className="ml-auto text-[13px] text-gold-text">Change</span>
          </button>
        </AssignDialog>
      ) : (
        <p className="mt-2.5 flex min-h-[52px] items-center gap-2.5 rounded-[14px] bg-[#F6F8FC] px-3 text-sm font-bold">
          <AssigneeMark name={request.assignee?.name} />
          {request.assignee
            ? `${request.assignee.name}${isDeveloper ? " (you)" : ""}`
            : "Unassigned"}
        </p>
      )}
    </section>
  );
}

function AssigneeMark({ name }: { name?: string }) {
  if (!name) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-full bg-tint text-navy-700"
      >
        —
      </span>
    );
  }
  return <Avatar name={name} tone="tint" className="size-8 text-xs" />;
}
