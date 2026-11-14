"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { Button, TextLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, Tile } from "@/components/ui/card";
import { Chip, ChipGroup, RadioCard, RadioCards } from "@/components/ui/choice";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { KpiTile } from "@/components/ui/kpi-tile";
import { NotificationRow } from "@/components/ui/notification-row";
import { LabelPill } from "@/components/ui/pill";
import { Stepper } from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import {
  pillGroups,
  priorities,
  requestTypes,
  roles,
  type PillGroup,
  type Priority,
  type RequestStatus,
  type RequestType,
} from "@/lib/labels";
import { routes } from "@/lib/routes";

/**
 * Development-only gallery of every shared component (see /dev/components).
 * The sample rows below are from the design and are only for looking at.
 */

type SampleRequest = {
  code: string;
  subject: string;
  customer: string;
  priority: Priority;
  status: RequestStatus;
  updated: string;
};

const sampleRequests: SampleRequest[] = [
  {
    code: "TKT-2026-00124",
    subject: "Payment page times out on mobile",
    customer: "James Carter · Northgate Tours",
    priority: "URGENT",
    status: "SUBMITTED",
    updated: "Today, 09:12",
  },
  {
    code: "TKT-2026-00123",
    subject: "Overnight inventory sync failing",
    customer: "Lina Haddad · Atlas Outdoor",
    priority: "HIGH",
    status: "UNDER_REVIEW",
    updated: "8 Nov 2026",
  },
  {
    code: "TKT-2026-00118",
    subject: "Multi-city flight search returns no results",
    customer: "Sarah Mitchell · Bluewave Holidays",
    priority: "HIGH",
    status: "IN_PROGRESS",
    updated: "Today, 08:50",
  },
];

const pillGroupTitles: Record<PillGroup, string> = {
  requestStatus: "Request status",
  priority: "Priority",
  role: "Role",
  userStatus: "Account",
  projectStatus: "Project",
  demoStatus: "Demo requests",
  quoteStatus: "Quote requests",
  contactStatus: "Messages",
  sla: "SLA",
};

export function ComponentGallery() {
  const toast = useToast();
  const [priority, setPriority] = React.useState<Priority>("MEDIUM");
  const [requestType, setRequestType] =
    React.useState<RequestType>("BUG_REPORT");
  const [role, setRole] = React.useState("DEVELOPER");

  return (
    <div className="min-h-screen bg-portal-bg">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-[clamp(16px,3vw,32px)] py-10">
        <header className="flex flex-col gap-4">
          <Logo eager className="h-8 self-start" />
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.03em]">
            Components
          </h1>
          <p className="max-w-2xl text-[15px] leading-[1.6] text-body">
            Every shared building block, to compare with the design. This page
            only exists on a developer&apos;s PC.
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <TextLink href={routes.home}>Website layout</TextLink>
            <TextLink href={routes.portal}>Client portal layout</TextLink>
            <TextLink href={routes.team}>Team panel layout</TextLink>
            <TextLink href={`${routes.team}?role=developer`}>
              Team panel as a developer
            </TextLink>
          </p>
        </header>

        <Section title="Logo">
          <div className="flex flex-wrap items-center gap-8">
            <Logo className="h-8" />
            <Logo variant="stacked" className="h-16" />
            <Logo variant="symbol" className="h-8" />
          </div>
          <div className="flex flex-wrap items-center gap-8 rounded-2xl bg-navy p-6">
            <Logo onNavy className="h-8" />
            <Logo variant="stacked" onNavy className="h-16" />
          </div>
        </Section>

        <Section title="Buttons">
          <Row label="Portal size">
            <Button>Navy</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="dangerOutline">Danger outline</Button>
            <Button disabled>Disabled</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus aria-hidden="true" className="size-[18px]" />
            </Button>
            <Button>
              <Plus aria-hidden="true" className="size-4" />
              With an icon
            </Button>
          </Row>
          <Row label="Website size">
            <Button size="site" variant="gold">
              Book a demo
            </Button>
            <Button size="site">Get a quote</Button>
            <Button size="site" variant="outline">
              Outline
            </Button>
            <Button asChild size="siteSm">
              <Link href={routes.contact}>A link that looks like a button</Link>
            </Button>
          </Row>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-navy p-6">
            <Button variant="gold" size="lg">
              Gold on navy
            </Button>
            <Button variant="ghostOnNavy" size="lg">
              Ghost on navy
            </Button>
            <TextLink href={routes.contact} onNavy>
              Text link on navy
            </TextLink>
          </div>
          <Row label="Text link">
            <TextLink href={routes.portalRequests}>View all</TextLink>
          </Row>
        </Section>

        <Section title="Pills">
          {(Object.keys(pillGroupTitles) as PillGroup[]).map((group) => (
            <Row key={group} label={pillGroupTitles[group]}>
              {Object.keys(pillGroups[group]).map((value) => (
                <LabelPill key={value} group={group} value={value as never} />
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Form fields">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input name="name" placeholder="Your name" autoComplete="name" />
            </Field>
            <Field
              label="Work email"
              required
              error="Enter a valid email address"
            >
              <Input
                type="email"
                name="email"
                defaultValue="sarah@bluewave"
                autoComplete="email"
              />
            </Field>
            <Field label="Project type" hint="Pick the closest match.">
              <Select name="projectType" defaultValue="NEW_WEBSITE">
                <option value="TRAVEL_BOOKING_PLATFORM">
                  Travel booking platform
                </option>
                <option value="NEW_WEBSITE">New website</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="Phone">
              <Input name="phone" disabled defaultValue="+44 20 7946 0321" />
            </Field>
            <Field label="Requirements" required className="sm:col-span-2">
              <Textarea
                name="requirements"
                placeholder="Tell us what you want to build"
              />
            </Field>
          </div>
          <Checkbox name="keep" defaultChecked>
            Keep me signed in
          </Checkbox>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="all">
            <TabsList aria-label="Requests">
              <TabsTrigger value="all" count={10}>
                All
              </TabsTrigger>
              <TabsTrigger value="new" count={1}>
                New
              </TabsTrigger>
              <TabsTrigger value="progress" count={2}>
                In progress
              </TabsTrigger>
              <TabsTrigger value="closed" count={1}>
                Closed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">All requests would show here.</TabsContent>
            <TabsContent value="new">New requests would show here.</TabsContent>
            <TabsContent value="progress">
              Requests in progress would show here.
            </TabsContent>
            <TabsContent value="closed">
              Closed requests would show here.
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="quote">
            <TabsList look="track" aria-label="Contact form">
              <TabsTrigger value="quote">Get a quote</TabsTrigger>
              <TabsTrigger value="message">Send a message</TabsTrigger>
            </TabsList>
            <TabsContent value="quote">
              The quote form would show here.
            </TabsContent>
            <TabsContent value="message">
              The message form would show here.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Chips and radio cards">
          <Row label={`Chips (picked: ${priorities[priority].label})`}>
            <ChipGroup
              aria-label="Priority"
              value={priority}
              onValueChange={(value) => setPriority(value as Priority)}
            >
              {(Object.keys(priorities) as Priority[]).map((value) => (
                <Chip key={value} value={value}>
                  {priorities[value].label}
                </Chip>
              ))}
            </ChipGroup>
          </Row>
          <RadioCards
            aria-label="Request type"
            value={requestType}
            onValueChange={(value) => setRequestType(value as RequestType)}
          >
            {(Object.keys(requestTypes) as RequestType[]).map((value) => (
              <RadioCard
                key={value}
                value={value}
                title={requestTypes[value].label}
                description={requestTypes[value].description}
              />
            ))}
          </RadioCards>
          <RadioCards
            aria-label="Role"
            value={role}
            onValueChange={setRole}
            className="grid-cols-1 sm:grid-cols-3"
          >
            {(["ADMIN", "MANAGER", "DEVELOPER"] as const).map((value) => (
              <RadioCard
                key={value}
                value={value}
                showDot
                title={roles[value].label}
                description="With the round mark, for roles and lost reasons"
              />
            ))}
          </RadioCards>
        </Section>

        <Section title="Stepper">
          <Stepper
            steps={["Project", "Request type", "Details", "Review"]}
            current={2}
          />
        </Section>

        <Section title="Banners">
          <Banner>Details copied from QUO-2026-040. Check them first.</Banner>
          <Banner variant="ok">This request was resolved.</Banner>
          <Banner variant="muted">This request is closed.</Banner>
          <Banner variant="warning">
            We are waiting for your reply on this request.
          </Banner>
        </Section>

        <Section title="Avatars">
          <Row label="Tones and sizes">
            <Avatar name="Sarah Mitchell" />
            <Avatar name="Hamza Siddiqui" tone="gold" />
            <Avatar name="Emma Clarke" tone="tint" />
            <Avatar name="Daniyal Ahmed" size="sm" />
            <Avatar name="Sofia Martins" size="lg" />
          </Row>
        </Section>

        <Section title="Number tiles">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
            <KpiTile label="Total requests" value={6} />
            <KpiTile label="Open requests" value={7} hint="1 new" tone="navy" />
            <KpiTile label="In progress" value={1} tone="info" />
            <KpiTile label="Waiting for you" value={1} tone="warning" />
            <KpiTile label="At risk of SLA" value={1} tone="danger" />
            <KpiTile label="Resolved" value={3} tone="success" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent requests</CardTitle>
                <TextLink href={routes.portalRequests}>View all</TextLink>
              </CardHeader>
              <p className="mt-3 text-sm leading-[1.6] text-body">
                A white card with a title and an action.
              </p>
            </Card>
            <Card>
              <CardTitle>Website leads</CardTitle>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Tile>
                  <p className="text-[13px] font-bold text-muted-foreground">
                    New demo requests
                  </p>
                  <p className="mt-1 font-heading text-[28px] font-bold">2</p>
                </Tile>
                <Tile>
                  <p className="text-[13px] font-bold text-muted-foreground">
                    New quote requests
                  </p>
                  <p className="mt-1 font-heading text-[28px] font-bold">2</p>
                </Tile>
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Table (cards on phones)">
          <DataTable
            caption="Support requests"
            rows={sampleRequests}
            rowKey={(request) => request.code}
            columns={[
              {
                header: "Request",
                cell: (request) => request.code,
                className: "whitespace-nowrap",
              },
              {
                header: "Subject · Customer",
                primary: true,
                cell: (request) => (
                  <>
                    <span className="block font-bold">{request.subject}</span>
                    <span className="block text-[13px] font-normal text-muted-foreground">
                      {request.customer}
                    </span>
                  </>
                ),
              },
              {
                header: "Priority",
                cell: (request) => (
                  <LabelPill group="priority" value={request.priority} />
                ),
              },
              {
                header: "Status",
                cell: (request) => (
                  <LabelPill group="requestStatus" value={request.status} />
                ),
              },
              {
                header: "Updated",
                cell: (request) => (
                  <span className="whitespace-nowrap text-body">
                    {request.updated}
                  </span>
                ),
              },
            ]}
          />
          <DataTable
            caption="Empty table"
            rows={[] as SampleRequest[]}
            rowKey={(request) => request.code}
            columns={[{ header: "Request", cell: (request) => request.code }]}
            empty="No requests match these filters."
          />
        </Section>

        <Section title="Notification rows">
          <Card className="overflow-hidden p-0">
            <p className="px-5 py-4 text-[15px] font-bold">2 unread</p>
            <NotificationRow
              kind="reply"
              heading="New reply"
              text="Daniyal Ahmed replied to TKT-2026-00118"
              time="Today, 08:50"
              href={routes.portalNotifications}
              unread
            />
            <NotificationRow
              kind="info"
              heading="Action required"
              text="TKT-2026-00122 needs more information from you"
              time="8 Nov"
              href={routes.portalNotifications}
              unread
            />
            <NotificationRow
              kind="status"
              heading="Status change"
              text="TKT-2026-00121 moved to Under Review"
              time="7 Nov"
              href={routes.portalNotifications}
            />
            <NotificationRow
              kind="lead"
              text="New demo request DEM-2026-031 from Olivia Grant, Skyhaven Travel"
              time="Today, 10:12"
              href={routes.teamNotifications}
            />
          </Card>
        </Section>

        <Section title="Dialog and toast">
          <Row label="Open them">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Assign developer</DialogTitle>
                <DialogDescription>
                  TKT-2026-00124 · Payment page times out on mobile
                </DialogDescription>
                <div className="mt-[18px]">
                  <Field label="Note for the developer">
                    <Textarea rows={3} />
                  </Field>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => toast("Request assigned")}>
                      Assign
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => toast("Settings saved")}>
              Show toast
            </Button>
          </Row>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-line-2 pb-2 text-xl font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
