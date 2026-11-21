import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { beforeAll, describe, expect, it } from "vitest";

import { DateInput } from "./date-input";
import { Field } from "./field";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function Start(props: Partial<React.ComponentProps<typeof DateInput>>) {
  return (
    <Field label="Start date">
      <DateInput {...props} />
    </Field>
  );
}

const box = () => screen.getByRole("textbox", { name: "Start date" });

describe("DateInput", () => {
  it("reads a typed date when the box is left", () => {
    const changes: string[] = [];
    render(<Start onChange={(event) => changes.push(event.target.value)} />);
    fireEvent.change(box(), { target: { value: "21 Nov 2026" } });
    expect(changes).toEqual([]);
    fireEvent.blur(box());
    expect(changes).toEqual(["2026-11-21"]);
    expect(box()).toHaveValue("21/11/2026");

    fireEvent.change(box(), { target: { value: "2026-12-01" } });
    fireEvent.keyDown(box(), { key: "Enter" });
    expect(changes).toEqual(["2026-11-21", "2026-12-01"]);

    fireEvent.change(box(), { target: { value: "" } });
    fireEvent.blur(box());
    expect(changes).toEqual(["2026-11-21", "2026-12-01", ""]);
  });

  it("goes back to the last good day and says why", () => {
    const changes: string[] = [];
    render(
      <Start
        defaultValue="2026-11-21"
        onChange={(event) => changes.push(event.target.value)}
      />,
    );
    fireEvent.change(box(), { target: { value: "31/02/2026" } });
    fireEvent.blur(box());
    expect(changes).toEqual([]);
    expect(box()).toHaveValue("21/11/2026");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Write the date like 21/11/2026, or pick it",
    );
    expect(box()).toHaveAttribute("aria-invalid", "true");
  });

  it("works with react-hook-form and picks from the calendar", () => {
    const held: { form?: UseFormReturn<{ startDate: string }> } = {};
    function Form() {
      const form = useForm({ defaultValues: { startDate: "2026-01-05" } });
      React.useEffect(() => {
        held.form = form;
      });
      return <Start {...form.register("startDate")} />;
    }
    render(<Form />);
    const form = held.form!;
    expect(box()).toHaveValue("05/01/2026");

    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    const grid = screen.getByRole("grid", { name: "January 2026" });
    expect(grid).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Monday 5 January 2026" }),
    ).toHaveFocus();
    expect(
      screen
        .getByRole("button", { name: "Monday 5 January 2026" })
        .closest("td"),
    ).toHaveAttribute("aria-selected", "true");

    // A week on with the keyboard, then Enter.
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(
      screen.getByRole("button", { name: "Monday 12 January 2026" }),
    ).toHaveFocus();
    fireEvent.click(
      screen.getByRole("button", { name: "Monday 12 January 2026" }),
    );
    expect(form.getValues("startDate")).toBe("2026-01-12");
    expect(box()).toHaveValue("12/01/2026");
    expect(screen.queryByRole("grid")).toBeNull();

    act(() => form.reset({ startDate: "" }));
    expect(box()).toHaveValue("");
  });

  it("moves through months and years", () => {
    render(<Start defaultValue="2026-11-21" />);
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "December 2026" })).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", {
        name: /December 2026: choose another month/,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /2026: choose another year/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Later years" }));
    fireEvent.click(screen.getByRole("button", { name: "2030" }));
    fireEvent.click(screen.getByRole("button", { name: "March 2030" }));
    expect(screen.getByRole("grid", { name: "March 2030" })).toBeVisible();
  });

  it("keeps days before the earliest one closed", () => {
    const changes: string[] = [];
    render(
      <Start
        min="2026-11-10"
        defaultValue="2026-11-21"
        onChange={(event) => changes.push(event.target.value)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(
      screen.getByRole("button", { name: "Monday 9 November 2026" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toBeDisabled();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    fireEvent.change(box(), { target: { value: "01/11/2026" } });
    fireEvent.blur(box());
    expect(changes).toEqual([]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a day from 10/11/2026",
    );
  });

  it("gives a form that goes to the address its value", () => {
    render(
      <form aria-label="Report choices">
        <label>
          From
          <DateInput name="from" defaultValue="2026-11-01" />
        </label>
      </form>,
    );
    const form = screen.getByRole("form", { name: "Report choices" });
    expect(new FormData(form as HTMLFormElement).get("from")).toBe(
      "2026-11-01",
    );
    const from = screen.getByRole("textbox", { name: "From" });
    fireEvent.change(from, { target: { value: "15/11/2026" } });
    fireEvent.keyDown(from, { key: "Enter" });
    expect(new FormData(form as HTMLFormElement).get("from")).toBe(
      "2026-11-15",
    );
  });
});
