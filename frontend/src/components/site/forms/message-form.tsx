"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  FormAlert,
  Honeypot,
  SiteField,
  SuccessTick,
} from "@/components/site/forms/site-field";
import { apiErrorMessage } from "@/lib/api";
import {
  firstName,
  messageDefaults,
  messageSchema,
  type Message,
  type MessageInput,
} from "@/lib/forms/schemas";
import { submitLead } from "@/lib/forms/submit";
import { messageTopics, type MessageTopic } from "@/lib/labels";

/** Send a message (docs/01, "Send a message"), the second tab on Contact. */
export function MessageForm() {
  const pathname = usePathname();
  const [sent, setSent] = React.useState<Message | null>(null);
  const [failed, setFailed] = React.useState("");
  const [honeypot, setHoneypot] = React.useState("");

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: messageDefaults,
  });
  const { errors, isSubmitting, submitCount } = form.formState;
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  const onSubmit = form.handleSubmit(async (values) => {
    const message = messageSchema.parse(values);
    setFailed("");
    try {
      await submitLead({ kind: "message", data: message }, pathname, honeypot);
      setSent(message);
    } catch (error) {
      setFailed(apiErrorMessage(error));
    }
  });

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-3.5">
        <SuccessTick />
        <p className="m-0 font-heading text-2xl font-bold tracking-[-0.02em]">
          Message sent
        </p>
        <p className="m-0 text-[15px] leading-[1.6] text-body">
          Thanks, {firstName(sent.name)}. We will reply to{" "}
          <b className="text-navy">{sent.email}</b> within [X business days].
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              form.reset(messageDefaults);
              setSent(null);
            }}
            className="h-[46px] cursor-pointer rounded-[10px] border border-input bg-white px-[18px] text-[15px] font-semibold text-navy"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      aria-label="Send a message"
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-3.5"
    >
      <Honeypot value={honeypot} onChange={setHoneypot} />
      <SiteField label="Topic" kind="select">
        {(props) => (
          <select {...props} {...form.register("topic")}>
            {(Object.keys(messageTopics) as MessageTopic[]).map((key) => (
              <option key={key} value={key}>
                {messageTopics[key].label}
              </option>
            ))}
          </select>
        )}
      </SiteField>

      <div className="flex flex-wrap gap-3.5">
        <SiteField
          label="Full name *"
          error={errors.name?.message}
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...props}
              {...form.register("name")}
            />
          )}
        </SiteField>
        <SiteField
          label="Email *"
          error={errors.email?.message}
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...props}
              {...form.register("email")}
            />
          )}
        </SiteField>
      </div>

      <SiteField
        label="Message *"
        kind="textarea"
        error={errors.message?.message}
      >
        {(props) => (
          <textarea
            rows={6}
            placeholder="How can we help?"
            {...props}
            {...form.register("message")}
          />
        )}
      </SiteField>

      {hasErrors ? (
        <FormAlert>Please fix the highlighted fields.</FormAlert>
      ) : failed ? (
        <FormAlert>{failed}</FormAlert>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-[52px] cursor-pointer rounded-[10px] bg-navy text-base font-semibold text-white disabled:opacity-60"
      >
        Send message
      </button>
    </form>
  );
}
