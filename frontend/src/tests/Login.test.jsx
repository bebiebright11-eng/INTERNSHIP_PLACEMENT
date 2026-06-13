import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

// Mock API
vi.mock("../api", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  MemoryRouter: ({ children }) => <div>{children}</div>,
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Login", () => {

  // TEST 1 - Renders login form
  test("renders login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login To Your Account/i)).toBeInTheDocument();
  });

  // TEST 2 - Renders username input
  test("renders username input field", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(
      screen.getByPlaceholderText(/Registration Number/i)
    ).toBeInTheDocument();
  });

  // TEST 3 - Renders password input
  test("renders password input field", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(
      screen.getByPlaceholderText(/Password/i)
    ).toBeInTheDocument();
  });

  // TEST 4 - Renders Sign In button
  test("renders Sign In button", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/SIGN IN/i)).toBeInTheDocument();
  });

  // TEST 5 - Renders system title
  test("renders Internship Placement System title", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Internship Placement System/i)
    ).toBeInTheDocument();
  });

  // TEST 6 - Renders Forgot Password link
  test("renders Forgot Password link", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });

  // TEST 7 - Renders Activate here link
  test("renders Activate here link", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/Activate here/i)).toBeInTheDocument();
  });

  // TEST 8 - Username input accepts typing
  test("username input accepts typed value", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/Registration Number/i);
    fireEvent.change(input, { target: { value: "student@iles.com" } });
    expect(input.value).toBe("student@iles.com");
  });

  // TEST 9 - Password input accepts typing
  test("password input accepts typed value", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(input, { target: { value: "Test1234!" } });
    expect(input.value).toBe("Test1234!");
  });

});