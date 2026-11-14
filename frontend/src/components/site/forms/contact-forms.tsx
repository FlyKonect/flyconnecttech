"use client";

import { Tabs } from "radix-ui";

import { MessageForm } from "@/components/site/forms/message-form";
import { QuoteForm } from "@/components/site/forms/quote-form";

const tab =
  "h-11 min-w-0 flex-1 cursor-pointer rounded-[9px] text-[15px] font-semibold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-[0_1px_2px_rgba(2,26,84,0.12),0_0_0_1px_#E1E8F2]";

/**
 * The form card on the Contact page: Get a quote (full form) and Send a
 * message, as two tabs. Arrow keys move between the tabs.
 */
export function ContactForms() {
  return (
    <Tabs.Root defaultValue="quote">
      <Tabs.List
        aria-label="Contact options"
        className="flex gap-1 rounded-xl bg-chip p-1"
      >
        <Tabs.Trigger value="quote" className={tab}>
          Get a quote
        </Tabs.Trigger>
        <Tabs.Trigger value="message" className={tab}>
          Send a message
        </Tabs.Trigger>
      </Tabs.List>
      {/* Each tab keeps what was typed while the other one is open. */}
      <Tabs.Content
        value="quote"
        forceMount
        className="mt-6 data-[state=inactive]:hidden"
      >
        <QuoteForm variant="full" />
      </Tabs.Content>
      <Tabs.Content
        value="message"
        forceMount
        className="mt-6 data-[state=inactive]:hidden"
      >
        <MessageForm />
      </Tabs.Content>
    </Tabs.Root>
  );
}
