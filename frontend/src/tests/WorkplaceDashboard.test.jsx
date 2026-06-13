import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import WorkplaceDashboard from "../pages/WorkplaceDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: [],
      })
    ),
  },
}));

describe("Workplace Dashboard", () => {
  test("renders key dashboard sections", async () => {
    render(
      <MemoryRouter>
        <WorkplaceDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Workplace Supervisor Dashboard/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Assigned Students/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Evaluated/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Pending/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Important Notes/i)
    ).toBeInTheDocument();
  });
});