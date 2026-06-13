import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

describe("ProtectedRoute", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // TEST 1 - Allows access when token and role are correct
  test("allows access when token and role are correct", () => {
    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "student");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="student">
          <h1>Student Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Student Dashboard")).toBeTruthy();
  });

  // TEST 2 - Blocks access when no token
  test("blocks access when no token is present", () => {
    localStorage.setItem("role", "student");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="student">
          <h1>Student Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Student Dashboard")).toBeNull();
  });

  // TEST 3 - Blocks access when wrong role
  test("blocks access when role does not match", () => {
    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "workplace");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="student">
          <h1>Student Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Student Dashboard")).toBeNull();
  });

  // TEST 4 - Allows workplace supervisor access
  test("allows access for workplace supervisor role", () => {
    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "workplace");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="workplace">
          <h1>Workplace Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Workplace Dashboard")).toBeTruthy();
  });

  // TEST 5 - Allows academic supervisor access
  test("allows access for academic supervisor role", () => {
    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "academic");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="academic">
          <h1>Academic Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Academic Dashboard")).toBeTruthy();
  });

  // TEST 6 - Allows admin access
  test("allows access for admin role", () => {
    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "admin");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="admin">
          <h1>Admin Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Dashboard")).toBeTruthy();
  });

});