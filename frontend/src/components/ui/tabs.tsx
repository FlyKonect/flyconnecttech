"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Tabs, with an optional count on each tab.
 *
 *   <Tabs defaultValue="all">
 *     <TabsList aria-label="Requests">
 *       <TabsTrigger value="all" count={10}>All</TabsTrigger>
 *       <TabsTrigger value="new" count={1}>New</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="all">…</TabsContent>
 *   </Tabs>
 *
 * Two looks: "pill" (separate bordered tabs, used in the portal and team
 * panel) and "track" (tabs inside one grey track, used on the website).
 * Arrow keys move between tabs.
 */

type TabsLook = "pill" | "track";
const LookContext = React.createContext<TabsLook>("pill");

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  look = "pill",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { look?: TabsLook }) {
  return (
    <LookContext value={look}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          look === "pill"
            ? "flex flex-wrap gap-2"
            : "inline-flex w-fit max-w-full gap-1 rounded-xl bg-chip p-1",
          className,
        )}
        {...props}
      />
    </LookContext>
  );
}

function TabsTrigger({
  className,
  count,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { count?: number }) {
  const look = React.use(LookContext);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-[10px] text-[13px] font-bold whitespace-nowrap transition-colors",
        look === "pill"
          ? "min-h-10 border border-stroke bg-white px-3.5 text-body hover:bg-soft data-[state=active]:border-navy data-[state=active]:bg-navy data-[state=active]:text-white"
          : "min-h-10 flex-1 justify-center px-4 text-body data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-[0_1px_2px_rgba(2,26,84,0.12)]",
        className,
      )}
      {...props}
    >
      {children}
      {count === undefined ? null : (
        <span className="font-semibold opacity-80">{count}</span>
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
