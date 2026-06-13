import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import WorkplaceDashboard from "../pages/WorkplaceDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock Footer
vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

// Mock Header
vi.mock("../components/DashboardHeader", () => ({
  default: ({ dashboardTitle }) => <h1>{dashboardTitle}</h1>,
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <WorkplaceDashboard />
    </MemoryRouter>
  );

describe("Workplace Dashboard", () => {

  // TEST 1 - Renders dashboard title
  test("renders dashboard title", async () => {
    renderComponent();
    expect(
      await screen.findByText(/Workplace Supervisor Dashboard/i)
    ).toBeInTheDocument();
  });

  // TEST 2 - Renders Assigned Students card
  test("renders Assigned Students summary card", () => {
    renderComponent();
    expect(screen.getByText(/Assigned Students/i)).toBeInTheDocument();
  });

  // TEST 3 - Renders Evaluated card
  test("renders Evaluated summary card", () => {
    renderComponent();
    expect(screen.getByText(/Evaluated/i)).toBeInTheDocument();
  });

  // TEST 4 - Renders Pending card
  test("renders Pending summary card", () => {
    renderComponent();
    expect(screen.getAllByText(/Pending/i).length).toBeGreaterThan(0);
  });

  // TEST 5 - Renders Menu button
  test("renders Menu button", () => {
    renderComponent();
    expect(screen.getByText(/Menu/i)).toBeInTheDocument();
  });

  // TEST 6 - Menu opens when clicked
  test("opens menu when Menu button is clicked", () => {
    renderComponent();
    const menuButton = screen.getByText(/Menu/i);
    fireEvent.click(menuButton);
    expect(screen.getByText(/My Students/i)).toBeInTheDocument();
    expect(screen.getByText(/My Evaluations/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  // TEST 7 - Shows no students message when no placements
  test("shows no students assigned message when placements are empty", () => {
    renderComponent();
    expect(screen.getByText(/No students assigned/i)).toBeInTheDocument();
  });

  // TEST 8 - Renders Important Notes section
  test("renders Important Notes section", () => {
    renderComponent();
    expect(screen.getByText(/Important Notes/i)).toBeInTheDocument();
  });

  // TEST 9 - Renders Footer
  test("renders Footer", () => {
    renderComponent();
    expect(screen.getByText(/Footer/i)).toBeInTheDocument();
  });

  // TEST 10 - Summary cards show zero counts when no data
  test("shows zero counts on summary cards when no data", () => {
    renderComponent();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

});