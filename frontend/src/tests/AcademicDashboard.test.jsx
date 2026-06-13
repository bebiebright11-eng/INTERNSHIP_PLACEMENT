import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import AcademicDashboard from "../pages/AcademicDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({ data: [] })
    ),
  },
}));

// Mock react-router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("Academic Dashboard", () => {
  test("renders key dashboard sections", () => {
    render(<AcademicDashboard />);

    expect(
      screen.getByText(/Academic Supervisor Dashboard/i)
    ).toBeInTheDocument();

    expect(
    screen.getByText(/Academic Supervisor Dashboard/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Evaluated Students/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Pending Students/i)
    ).toBeInTheDocument();
  });
});