import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, vi } from "vitest";
import AcademicDashboard from "../pages/AcademicDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
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

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Academic Dashboard", () => {

  // TEST 1 - Renders dashboard title
  test("renders dashboard title", () => {
    render(<AcademicDashboard />);
    expect(
      screen.getByText(/Academic Supervisor Dashboard/i)
    ).toBeInTheDocument();
  });

  // TEST 2 - Renders Assigned Students card (FIXED)
  test("renders Assigned Students summary card", () => {
    render(<AcademicDashboard />);
    expect(
      screen.getAllByText(/Assigned Students/i).length
    ).toBeGreaterThan(0);
  });

  // TEST 3 - Renders Evaluated Students card
  test("renders Evaluated Students summary card", () => {
    render(<AcademicDashboard />);
    expect(screen.getByText(/Evaluated Students/i)).toBeInTheDocument();
  });

  // TEST 4 - Renders Pending Students card
  test("renders Pending Students summary card", () => {
    render(<AcademicDashboard />);
    expect(screen.getByText(/Pending Students/i)).toBeInTheDocument();
  });

  // TEST 5 - Renders Menu button
  test("renders Menu button", () => {
    render(<AcademicDashboard />);
    expect(screen.getByText(/Menu/i)).toBeInTheDocument();
  });

  // TEST 6 - Menu opens when clicked
  test("opens menu when Menu button is clicked", () => {
    render(<AcademicDashboard />);
    const menuButton = screen.getByText(/Menu/i);
    fireEvent.click(menuButton);
    expect(screen.getByText(/My Students/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluations/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  // TEST 7 - Shows no students message when placements are empty
  test("shows no students assigned message when placements are empty", () => {
    render(<AcademicDashboard />);
    expect(screen.getByText(/No students assigned/i)).toBeInTheDocument();
  });

  // TEST 8 - Renders Assigned Students heading on home page (FIXED)
  test("renders Assigned Students heading on home page", () => {
    render(<AcademicDashboard />);
    expect(
      screen.getAllByText(/Assigned Students/i).length
    ).toBeGreaterThan(0);
  });

  // TEST 9 - Renders Footer
  test("renders Footer", () => {
    render(<AcademicDashboard />);
    expect(screen.getByText(/Footer/i)).toBeInTheDocument();
  });

  // TEST 10 - Summary cards show zero counts when no data
  test("shows zero counts on summary cards when no data", () => {
    render(<AcademicDashboard />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  // TEST 11 - Menu closes after clicking Home
  test("menu closes after clicking Home", () => {
    render(<AcademicDashboard />);
    const menuButton = screen.getByText(/Menu/i);
    fireEvent.click(menuButton);
    const homeItem = screen.getByText(/^Home$/i);
    fireEvent.click(homeItem);
    expect(screen.queryByText(/My Students/i)).not.toBeInTheDocument();
  });

});