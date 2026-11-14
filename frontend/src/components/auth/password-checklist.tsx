import { Check, X } from "lucide-react";

import { passwordRules } from "@/lib/auth/password-rules";
import { cn } from "@/lib/utils";

/**
 * The three password rules, ticked off while the person types (screens 03
 * and 05). Screen readers hear "met" or "not met yet" with each rule.
 */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul
      aria-label="Password rules"
      className="flex flex-col gap-1 rounded-[14px] bg-portal-bg px-4 py-3.5 text-sm leading-[1.6]"
    >
      {passwordRules.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2",
              met ? "text-[#15803D]" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check aria-hidden="true" className="size-3.5 shrink-0" />
            ) : (
              <X aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            {rule.label}
            <span className="sr-only">{met ? ", met" : ", not met yet"}</span>
          </li>
        );
      })}
    </ul>
  );
}
