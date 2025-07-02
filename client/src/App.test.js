import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders BrainedUP header", () => {
  render(<App />);
  const headerElement = screen.getByText(/BrainedUP/i);
  expect(headerElement).toBeInTheDocument();
});
