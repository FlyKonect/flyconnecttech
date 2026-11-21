import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Field } from "./field";
import { MultiSelect, Select, filterOptions, optionsOf } from "./select";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const open = (name: string) =>
  fireEvent.click(screen.getByRole("combobox", { name }));
const option = (name: string) => screen.getByRole("option", { name });

function Types(props: Partial<React.ComponentProps<typeof Select>>) {
  return (
    <Field label="Project type">
      <Select {...props}>
        <option value="">Choose one</option>
        <option value="WEB">Website</option>
        <option value="APP">Web application</option>
        <option value="OLD" disabled>
          Old kind
        </option>
      </Select>
    </Field>
  );
}

describe("Select", () => {
  it("reads the options, shows the chosen one and sends the change", () => {
    const changes: string[] = [];
    render(
      <Types
        defaultValue="WEB"
        onChange={(event) => changes.push(event.target.value)}
      />,
    );
    const box = screen.getByRole("combobox", { name: "Project type" });
    expect(box).toHaveTextContent("Website");

    open("Project type");
    const list = screen.getByRole("listbox", { name: "Project type" });
    expect(within(list).getAllByRole("option")).toHaveLength(4);
    expect(option("Website")).toHaveAttribute("aria-selected", "true");
    expect(option("Old kind")).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(option("Old kind"));
    expect(changes).toEqual([]);
    fireEvent.click(option("Web application"));
    expect(changes).toEqual(["APP"]);
    expect(box).toHaveTextContent("Web application");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("works with react-hook-form's register, defaults and reset", () => {
    const held: { form?: UseFormReturn<{ type: string }> } = {};
    function Form() {
      const form = useForm({ defaultValues: { type: "APP" } });
      React.useEffect(() => {
        held.form = form;
      });
      return <Types {...form.register("type")} />;
    }
    render(<Form />);
    const form = held.form!;
    const box = screen.getByRole("combobox", { name: "Project type" });
    expect(box).toHaveTextContent("Web application");

    open("Project type");
    fireEvent.click(option("Website"));
    expect(form.getValues("type")).toBe("WEB");

    act(() => form.reset({ type: "" }));
    expect(box).toHaveTextContent("Choose one");
    act(() => form.setValue("type", "APP"));
    expect(box).toHaveTextContent("Web application");
  });

  it("gives a form its value at once (filters that send on change)", () => {
    const sent: (string | null)[] = [];
    render(
      <form aria-label="Filters">
        <Types
          name="type"
          defaultValue=""
          onChange={(event) =>
            sent.push(new FormData(event.target.form!).get("type") as string)
          }
        />
      </form>,
    );
    open("Project type");
    fireEvent.click(option("Website"));
    expect(sent).toEqual(["WEB"]);
  });

  it("opens and chooses with the keyboard, and jumps by letters", () => {
    const changes: string[] = [];
    render(
      <Types
        defaultValue=""
        onChange={(event) => changes.push(event.target.value)}
      />,
    );
    const box = screen.getByRole("combobox", { name: "Project type" });
    fireEvent.keyDown(box, { key: "w" });
    expect(changes).toEqual(["WEB"]);

    fireEvent.keyDown(box, { key: "ArrowDown" });
    const list = screen.getByRole("listbox");
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "ArrowDown" });
    // The disabled one is skipped: still "Web application".
    fireEvent.keyDown(list, { key: "Enter" });
    expect(changes).toEqual(["WEB", "APP"]);
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = React.useState("WEB");
      return (
        <>
          <Types value={value} onChange={(e) => setValue(e.target.value)} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    open("Project type");
    fireEvent.click(option("Web application"));
    expect(screen.getByRole("status")).toHaveTextContent("APP");
  });

  it("searches long lists", () => {
    const changes: string[] = [];
    const names = [
      "Skyline Travel",
      "Bluewave Holidays",
      "Northwind Tours",
      "Aéro Voyages",
      "Coastline Trips",
      "Sunrise Escapes",
      "Polar Journeys",
      "Harbour Breaks",
      "Summit Getaways",
      "Meadow Holidays",
    ];
    render(
      <Select
        aria-label="Customer"
        defaultValue=""
        onChange={(event) => changes.push(event.target.value)}
      >
        <option value="">All customers</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>,
    );
    open("Customer");
    const search = screen.getByRole("combobox", { name: "Search the choices" });
    fireEvent.change(search, { target: { value: "holi" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Bluewave Holidays",
      "Meadow Holidays",
    ]);
    fireEvent.change(search, { target: { value: "aero" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(changes).toEqual(["Aéro Voyages"]);

    open("Customer");
    fireEvent.change(
      screen.getByRole("combobox", { name: "Search the choices" }),
      {
        target: { value: "zzz" },
      },
    );
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });

  it("reads options through fragments and groups", () => {
    expect(
      optionsOf(
        <>
          <option>Plain</option>
          <optgroup label="Europe">
            <option value="Europe/London">London {"(GMT)"}</option>
          </optgroup>
        </>,
      ),
    ).toEqual([
      { value: "Plain", label: "Plain", disabled: false, group: undefined },
      {
        value: "Europe/London",
        label: "London (GMT)",
        disabled: false,
        group: "Europe",
      },
    ]);
    expect(
      filterOptions([{ value: "a", label: "Karachi", group: "Asia" }], "asia"),
    ).toHaveLength(1);
  });
});

describe("MultiSelect", () => {
  it("ticks several, stays open, and clears", () => {
    const onChange = vi.fn();
    function People() {
      const [chosen, setChosen] = React.useState<string[]>([]);
      return (
        <Field label="Ask someone">
          <MultiSelect
            options={[
              { value: "p", label: "Priya Shah", hint: "Developer" },
              { value: "e", label: "Emma Clarke", hint: "Admin" },
            ]}
            value={chosen}
            onChange={(next) => {
              onChange(next);
              setChosen(next);
            }}
            placeholder="Choose people"
          />
        </Field>
      );
    }
    render(<People />);
    const box = screen.getByRole("combobox", { name: "Ask someone" });
    expect(box).toHaveTextContent("Choose people");

    open("Ask someone");
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );
    fireEvent.click(screen.getByRole("option", { name: /Priya Shah/ }));
    fireEvent.click(screen.getByRole("option", { name: /Emma Clarke/ }));
    expect(onChange).toHaveBeenLastCalledWith(["p", "e"]);
    expect(screen.getByText("2 chosen")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(box).toHaveTextContent("Priya ShahEmma Clarke");

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
