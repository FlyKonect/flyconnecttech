import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Logo } from "./logo";

test("shows the FlyConnect Tech logo", () => {
  render(<Logo />);

  const logo = screen.getByRole("img", { name: "FlyConnect Tech" });
  expect(logo).toHaveAttribute("src", "/brand/logo.svg");
});

test("uses the navy version on navy backgrounds", () => {
  render(<Logo onNavy />);

  expect(screen.getByRole("img", { name: "FlyConnect Tech" })).toHaveAttribute(
    "src",
    "/brand/logo-on-navy.svg",
  );
});

test("can show the stacked logo and the symbol", () => {
  const { rerender } = render(<Logo variant="stacked" />);
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "/brand/logo-stacked.svg",
  );

  rerender(<Logo variant="symbol" />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/brand/symbol.svg");
});
