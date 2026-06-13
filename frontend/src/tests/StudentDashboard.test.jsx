import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, vi } from "vitest";
import StudentDashboard from "../pages/StudentDashboard";

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
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

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Student Dashboard", () => {

  // TEST 1 - Renders dashboard title
  test("renders dashboard title", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Student Dashboard/i)).toBeInTheDocument();
  });

  // TEST 2 - Renders placement section
  test("renders My Placement section", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/My Placement/i)).toBeInTheDocument();
  });

  // TEST 3 - Shows not placed message when no placement
  test("shows not placed message when student has no placement", () => {
    render(<StudentDashboard />);
    expect(
      screen.getByText(/You have not been placed yet/i)
    ).toBeInTheDocument();
  });

  // TEST 4 - Renders weekly log form
  test("renders Add Weekly Log form", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Add Weekly Log/i)).toBeInTheDocument();
  });

  // TEST 5 - Renders submit log button
  test("renders Submit Log button", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Submit Log/i)).toBeInTheDocument();
  });

  // TEST 6 - Renders My Weekly Logs section
  test("renders My Weekly Logs section", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/My Weekly Logs/i)).toBeInTheDocument();
  });

  // TEST 7 - Shows no logs message when logs are empty
  test("shows no logs message when there are no logs", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
  });

  // TEST 8 - Renders Menu button
  test("renders Menu button", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Menu/i)).toBeInTheDocument();
  });

  // TEST 9 - Menu opens when clicked (FIXED - using getAllByText)
  test("opens menu when Menu button is clicked", () => {
    render(<StudentDashboard />);
    const menuButton = screen.getByText(/Menu/i);
    fireEvent.click(menuButton);
    expect(screen.getByText(/Organizations/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Applications/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  // TEST 10 - Renders summary stat cards (FIXED - using getAllByText)
  test("renders summary stat cards", () => {
    render(<StudentDashboard />);
    expect(screen.getAllByText(/Logs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Applications/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Approved/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Evaluations/i).length).toBeGreaterThan(0);
  });

  // TEST 11 - Renders Footer
  test("renders Footer", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Footer/i)).toBeInTheDocument();
  });

  // TEST 12 - Renders Important Notes section
  test("renders Important Notes section", () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Important Notes/i)).toBeInTheDocument();
  });

});