"use client";

import * as React from "react";
import { MonitorSmartphone } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { formatWhen } from "@/lib/format-time";

type Device = {
  id: string;
  device: string;
  signedInAt: string;
  lastUsedAt: string;
  current: boolean;
};

/** "Chrome on Windows" from a browser's user-agent text. */
export function deviceName(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "A browser";
  const system = /iPhone|iPad/.test(userAgent)
    ? "iPhone or iPad"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(userAgent)
          ? "Mac"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return system ? `${browser} on ${system}` : browser;
}

/**
 * Profile settings: where this account is signed in, and "Sign out
 * everywhere else" (every device but this one).
 */
export function SignedInDevices({ timeZone }: { timeZone: string }) {
  const toast = useToast();
  const [devices, setDevices] = React.useState<Device[] | null>(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  // Bumped after "Sign out everywhere else", to load the list again.
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    apiFetch<{ sessions: Device[] }>("/me/sessions").then(
      ({ sessions }) => {
        if (live) setDevices(sessions);
      },
      (failed: unknown) => {
        if (live) setError(apiErrorMessage(failed));
      },
    );
    return () => {
      live = false;
    };
  }, [version]);

  async function signOutOthers() {
    setBusy(true);
    setError("");
    try {
      const { signedOut } = await apiFetch<{ signedOut: number }>(
        "/me/sessions/sign-out-others",
        { method: "POST" },
      );
      toast(
        signedOut === 0
          ? "No other devices were signed in"
          : `Signed out on ${signedOut} other ${signedOut === 1 ? "device" : "devices"}`,
      );
      setVersion((v) => v + 1);
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  const others = devices?.filter((device) => !device.current).length ?? 0;

  return (
    <section
      aria-labelledby="signed-in-devices"
      className="rounded-[22px] border border-line-2 bg-white p-6 shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-navy-700"
        >
          <MonitorSmartphone className="size-[21px]" strokeWidth={1.9} />
        </span>
        <div>
          <h2 id="signed-in-devices" className="text-[17px] font-bold">
            Signed-in devices
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Sign out anywhere you no longer use.
          </p>
        </div>
      </div>
      {devices ? (
        <ul aria-label="Signed-in devices" className="mt-4 flex flex-col">
          {devices.map((device) => (
            <li
              key={device.id}
              className="border-t border-line-3 py-2.5 text-sm first:border-t-0"
            >
              <span className="font-bold">
                {deviceName(device.device)}
                {device.current ? (
                  <span className="ml-2 font-semibold text-gold-text">
                    This device
                  </span>
                ) : null}
              </span>
              <span className="block text-xs text-muted-foreground">
                Last used {formatWhen(device.lastUsedAt, timeZone)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      )}
      {error ? (
        <div className="mt-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={busy || !devices || others === 0}
        onClick={signOutOthers}
      >
        {busy ? "Signing out…" : "Sign out everywhere else"}
      </Button>
    </section>
  );
}
