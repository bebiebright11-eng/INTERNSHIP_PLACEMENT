import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, vi } from "vitest";
import StudentDashboard from "../pages/StudentDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({ data: [] })
    ),
  },
}));

// Mock Footer
vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

// Mock Header
vi.mock("../components/DashboardHeader", () => ({
  default: ({ dashboardTitle }) => (
    <h1>{dashboardTitle}</h1>
  ),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("Student Dashboard", () => {
  test("renders key dashboard sections", () => {
    render(<StudentDashboard />);

    expect(
      screen.getByText(/Student Dashboard/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/My Placement/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Add Weekly Log/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/My Weekly Logs/i)
    ).toBeInTheDocument();
  });
});